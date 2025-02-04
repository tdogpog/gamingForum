//util function for slug generation
function generateSlug(title, gameID) {
  const baseSlug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dashes
      .replace(/^-+|-+$/g, "") //trim leading and trailing dashes
      .substring(0, 50) + //url limit
    `-${gameID}`; //append the primary key

  return baseSlug;
}
