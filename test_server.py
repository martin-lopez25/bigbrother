import unittest
from pathlib import Path
from subprocess import CompletedProcess
from unittest.mock import patch

from server import (
    _bilibili_result,
    _instagram_result,
    _news_excerpt,
    _news_title,
    _parse_vtt,
    _reddit_result,
    _youtube_result,
    clean_text,
    extract_facts,
    extract_keywords,
    extractive_summary,
    search,
    search_bilibili,
    summarize_transcript,
    summarize_youtube_video,
)


class TextAnalysisTests(unittest.TestCase):
    def test_clean_text_removes_markup_and_normalizes_spaces(self):
        self.assertEqual(clean_text("<b>Solar</b>&nbsp;  energía"), "Solar energía")

    def test_extract_facts_finds_percentages_years_and_amounts(self):
        results = [
            {
                "title": "La energía solar creció 24% en 2025",
                "excerpt": "El proyecto costará $1.200 millones.",
            }
        ]
        self.assertEqual(
            extract_facts(results), ["24%", "2025", "$1.200 millones"]
        )

    def test_keywords_ignore_common_words(self):
        results = [
            {
                "title": "Energía solar y almacenamiento",
                "excerpt": "La energía solar impulsa baterías porque mejora el almacenamiento.",
            }
        ]
        keywords = extract_keywords(results)
        self.assertIn("solar", keywords)
        self.assertIn("almacenamiento", keywords)
        self.assertNotIn("porque", keywords)

    def test_summary_uses_source_sentences(self):
        sentence = (
            "La energía solar alcanzó una cifra récord durante el último año, "
            "según el informe publicado por el instituto."
        )
        self.assertEqual(
            extractive_summary([{"title": "Solar", "excerpt": sentence}]),
            f"• {sentence}",
        )

    def test_news_excerpt_drops_rss_title_and_publisher_duplicate(self):
        self.assertEqual(
            _news_excerpt("Solar report names a new record", "Solar report names a new record - Example News", "Example News"),
            "",
        )

    def test_news_title_removes_publisher_suffix(self):
        self.assertEqual(
            _news_title("Solar report names a new record - Example News", "Example News"),
            "Solar report names a new record",
        )

    def test_summary_ignores_title_only_and_wikipedia_navigation_fragments(self):
        results = [
            {
                "sourceKey": "news",
                "title": "Solar energy brings new records",
                "excerpt": "Solar energy brings new records",
            },
            {
                "sourceKey": "wikipedia",
                "title": "Solar energy in regions",
                "excerpt": "related solar pages Energy alternative Solar energy Data: "
                "solar energy in several regions and historical categories",
            },
        ]
        summary = extractive_summary(results)
        self.assertIn("no suficientes fragmentos narrativos", summary)

    def test_youtube_result_uses_a_canonical_video_url(self):
        result = _youtube_result(
            {
                "id": "abc-123",
                "title": "Solar energy",
                "channel": "Example Channel",
                "upload_date": "20261019",
            }
        )
        self.assertEqual(result["url"], "https://www.youtube.com/watch?v=abc-123")
        self.assertEqual(result["source"], "YouTube")
        self.assertEqual(result["videoId"], "abc-123")

    def test_vtt_parser_removes_cues_and_duplicate_caption_lines(self):
        transcript = _parse_vtt(
            "WEBVTT\nLanguage: es\n\n"
            "00:00:00.000 --> 00:00:02.000\n"
            "<c>La energía</c><00:00:00.500> solar produce electricidad.\n\n"
            "00:00:02.000 --> 00:00:03.000\n"
            "La energía solar produce electricidad.\n"
        )
        self.assertEqual(transcript, "La energía solar produce electricidad.")

    def test_youtube_summary_reads_local_spanish_subtitle_even_if_other_track_fails(self):
        vtt = (
            "WEBVTT\nLanguage: es\n\n"
            "00:00:00.000 --> 00:00:04.000\n"
            "La energía solar convierte la luz del sol en electricidad para los hogares "
            "y puede reducir el consumo de combustibles fósiles durante las horas diurnas.\n\n"
            "00:00:04.000 --> 00:00:08.000\n"
            "Los paneles fotovoltaicos producen energía limpia durante muchas décadas.\n"
        )

        def write_caption(command, **_kwargs):
            output_template = command[command.index("--output") + 1]
            caption_path = Path(output_template.replace("%(id)s.%(ext)s", "video123.es.vtt"))
            caption_path.write_text(vtt, encoding="utf-8")
            return CompletedProcess(command, 1, "", "otra pista de subtítulos falló")

        with patch("server.subprocess.run", side_effect=write_caption):
            result = summarize_youtube_video("5MKOe44upAc")
        self.assertEqual(result["language"], "es")
        self.assertGreater(result["transcriptCharacters"], 80)
        self.assertIn("energía solar", result["summary"].casefold())

    def test_transcript_summary_selects_blocks_without_sentence_punctuation(self):
        transcript = " ".join(
            [
                "paneles fotovoltaicos convierten radiacion solar electricidad hogares eficiencia",
                "baterias almacenan energia solar durante horas nocturnas autonomia vivienda",
                "paneles fotovoltaicos eficiencia produccion solar hogares electricidad limpia",
                "baterias energia almacenada sistemas solares nocturnos autonomia",
            ]
            * 5
        )
        summary = summarize_transcript(transcript)
        self.assertTrue(summary.startswith("• "))
        self.assertIn("fotovoltaicos", summary)

    def test_instagram_explore_result_links_to_public_post(self):
        result = _instagram_result(
            {
                "shortcode": "ABC123",
                "username": "creator",
                "caption": "Una publicación pública de Explore.",
            }
        )
        self.assertEqual(result["url"], "https://www.instagram.com/p/ABC123/")
        self.assertEqual(result["publisher"], "@creator")

    def test_reddit_result_normalizes_discussion_permalink(self):
        result = _reddit_result(
            {
                "title": "Discusión sobre energía solar",
                "permalink": "/r/energy/comments/abc/topic/",
                "subreddit": "energy",
                "selftext": "¿Qué experiencias tienen con esta tecnología?",
                "score": 12,
            }
        )
        self.assertEqual(
            result["url"], "https://www.reddit.com/r/energy/comments/abc/topic/"
        )
        self.assertEqual(result["points"], 12)

    def test_bilibili_result_cleans_title_markup_and_uses_https(self):
        result = _bilibili_result(
            {
                "title": "<em class=\"keyword\">Solar</em> panels",
                "arcurl": "http://www.bilibili.com/video/av123",
                "author": "Example Creator",
                "pubdate": 1792384200,
            }
        )
        self.assertEqual(result["title"], "Solar panels")
        self.assertEqual(result["url"], "https://www.bilibili.com/video/av123")

    def test_bilibili_search_only_uses_video_results(self):
        payload = {
            "code": 0,
            "data": {
                "result": [
                    {"result_type": "user", "data": [{"title": "Not a video"}]},
                    {
                        "result_type": "video",
                        "data": [
                            {
                                "title": "Solar video",
                                "arcurl": "http://www.bilibili.com/video/av123",
                                "author": "Creator",
                            }
                        ],
                    },
                ]
            },
        }
        with patch("server._fetch_bilibili_search", return_value=payload):
            results = search_bilibili("solar")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["title"], "Solar video")

    def test_social_sources_report_session_setup_when_opencli_is_missing(self):
        with patch("server.shutil.which", return_value=None):
            response = search("solar", ["instagram", "reddit"])
        self.assertEqual(
            response["sources"]["instagram"]["status"], "setup_required"
        )
        self.assertEqual(response["sources"]["reddit"]["status"], "setup_required")
        self.assertEqual(response["results"], [])


if __name__ == "__main__":
    unittest.main()