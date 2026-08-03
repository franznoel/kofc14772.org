export default function (eleventyConfig) {
  for (const path of [
    "CNAME",
    "css",
    "files",
    "font-awesome",
    "fonts",
    "img",
    "js"
  ]) {
    eleventyConfig.addPassthroughCopy(path);
  }

  return {
    dir: {
      input: ".",
      output: "_site"
    },
    templateFormats: ["html"]
  };
}
