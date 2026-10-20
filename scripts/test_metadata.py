"""Exercise content dates against real Git history, including generated changes."""
from datetime import datetime
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

import generate_metadata as metadata


class ContentDates(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.git('init', '--initial-branch=main')
        self.git('config', 'user.name', 'Metadata test')
        self.git('config', 'user.email', 'metadata@example.invalid')
        self.path = self.root / 'article.html'
        self.text = ('<html><head><title>Article</title></head><body>'
                     '<main><h1>Article</h1><p>更新日：2026年1月2日</p>'
                     '<p>Original content</p></main><footer>Site footer</footer></body></html>')
        self.path.write_text(self.text, encoding='utf-8')
        self.commit('2026-01-02', 'Publish article')
        self.root_patch = patch.object(metadata, 'ROOT', self.root)
        self.root_patch.start()
        self.addCleanup(self.root_patch.stop)
        clock_patch = patch.object(metadata, 'datetime', wraps=datetime)
        self.clock = clock_patch.start()
        self.addCleanup(clock_patch.stop)
        self.clock.now.return_value = datetime(2026, 10, 20, tzinfo=metadata.JST)

    def git(self, *args, **kwargs):
        return subprocess.run(['git', *args], cwd=self.root, capture_output=True,
                              text=True, check=True, **kwargs)

    def commit(self, day, message):
        self.git('add', '.')
        env = dict(os.environ, GIT_AUTHOR_DATE=day+'T12:00:00+09:00',
                   GIT_COMMITTER_DATE=day+'T12:00:00+09:00')
        self.git('commit', '-m', message, env=env)

    def write(self, text):
        self.path.write_text(text, encoding='utf-8')

    def test_generated_metadata_and_dates_do_not_make_dirty_page_newer(self):
        text = self.text.replace('</head>', '<meta property="og:title" content="New card">'
                                 '<!-- site-analytics:start --><script src="/analytics.js"></script>'
                                 '<!-- site-analytics:end --></head>')
        self.write(text.replace('2026年1月2日', '2026年10月20日'))
        self.assertEqual(metadata.modified_day(self.path), '2026-01-02')
        self.git('add', '.')
        self.assertEqual(metadata.modified_day(self.path), '2026-01-02')
        self.clock.now.return_value = datetime(2026, 10, 21, tzinfo=metadata.JST)
        self.assertEqual(metadata.modified_day(self.path), '2026-01-02')

    def test_metadata_only_commits_do_not_depend_on_message_prefix(self):
        self.write(self.text.replace('Article</title>', 'SEO title</title>'))
        self.commit('2026-02-03', 'Improve shared metadata')
        self.write(self.path.read_text().replace('2026年1月2日', '2026年2月3日'))
        self.commit('2026-03-04', 'chore: sync site metadata')
        self.assertEqual(metadata.modified_day(self.path), '2026-01-02')

    def test_committed_content_change_uses_its_own_day(self):
        self.write(self.text.replace('Original content', 'Updated content'))
        self.commit('2026-02-03', 'Update article')
        self.write(self.path.read_text().replace('Article</title>', 'SEO title</title>'))
        self.commit('2026-03-04', 'Update cards')
        self.assertEqual(metadata.modified_day(self.path), '2026-02-03')

    def test_uncommitted_content_change_uses_today_staged_or_unstaged(self):
        self.write(self.text.replace('Original content', 'Updated content'))
        self.assertEqual(metadata.modified_day(self.path), '2026-10-20')
        self.git('add', '.')
        self.assertEqual(metadata.modified_day(self.path), '2026-10-20')

    def test_formatting_and_invisible_scripts_do_not_change_content_day(self):
        self.write(self.text.replace('</h1><p>', '</h1>\n  <p>')
                   .replace('</main>', '<!-- regenerated --><script>window.flag = true;</script></main>'))
        self.assertEqual(metadata.modified_day(self.path), '2026-01-02')

    def test_shared_footer_does_not_change_article_day(self):
        self.write(self.text.replace('Site footer', 'Updated footer'))
        self.commit('2026-02-03', 'Update navigation')
        self.assertEqual(metadata.modified_day(self.path), '2026-01-02')

    def test_main_heading_and_links_count_as_content_changes(self):
        self.write(self.text.replace('<h1>Article</h1>', '<h1>New title</h1>'))
        self.assertEqual(metadata.modified_day(self.path), '2026-10-20')
        self.write(self.text.replace('Original content', '<a href="/guide/">Original content</a>'))
        self.assertEqual(metadata.modified_day(self.path), '2026-10-20')

    def test_new_page_without_history_uses_today(self):
        path = self.root / 'new.html'
        path.write_text(self.text, encoding='utf-8')
        self.assertEqual(metadata.modified_day(path), '2026-10-20')


if __name__ == '__main__':
    unittest.main()
