source "https://rubygems.org"

# Pinned to the Jekyll version GitHub Pages currently runs in production
# (see https://pages.github.com/versions/), so local builds match the
# deployed build. The site uses no Jekyll plugins, so the full `github-pages`
# gem isn't needed — it pulls in a large, slow-moving dependency chain
# (nokogiri, minitest, etc. pinned to old native-extension builds) that
# doesn't keep pace with current Ruby releases.
gem "jekyll", "3.9.5"

# Ruby 3.4+ dropped these from the default gems; Jekyll 3.9.5 and its
# dependencies (kramdown, safe_yaml) still require them unconditionally,
# so they must be declared explicitly here.
gem "csv"
gem "base64"
gem "bigdecimal"

# Ruby 3.0+ dropped webrick from default gems. Only `jekyll build` was
# exercised when the above three were added, so this one didn't surface
# until `jekyll serve` (webrick is the dev server) was actually run.
gem "webrick"
