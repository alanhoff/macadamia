# [MacAdamia Module](.) - Markdown

This loads Markdown files from a base directory and converts them to HTML which it serves. It supports conditional queries (If-None-Match & If-Modified-Since).

## Options

 * *options.root* - The base directory where files are served from
 * *options.headers* - An object containing headers to set
 * *options.maxAge* - The page should expire in so many seconds
 * *options.markdown*
   * *options.markdown.before* - Text to put before the rendered Markdown
   * *options.markdown.after* - Text to put after the rendered Markdown