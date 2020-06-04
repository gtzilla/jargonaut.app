# Jargonaut.app

Jargonaut.app -> The personal Jargon glossary. Start with our shared Internet Jargon glossary. Add your own, private, Jargon. Jargon is stored locally.
This is a Github Single Page Application. It relies on naming the primary file `index.html` The deploy script duplicates `index.html` to `404.html` so that Github will serve this for any not found URL. Any found URLs are returned. The found URLs are static/ and node-static/

## Deploy

Deploy by pushing to gh-pages. Run the `bash deploy/github.sh`


### Edge cases

The interface for /add-jargon allows automatically created acronyms to be edited. Examples

+ Federal Bureau of Investigation -> FBI not FBOI
+ Food and Drug Administration -> FDA not FADA

### Example Jargonaut Library

This is a sample gist with the library format. 

+ https://gist.github.com/gtzilla/baa44747da33f7483788f088e42df204

Directions for creating a shareable library using Github Gists

1. Visit https://gist.github.com/
2. Open export `/export-jargon` and copy the text using the Copy button.
3. Paste exported and create the Gist
4. Copy the Gist URL

In order to format, without exporting, object properties 

```json
{"phrase":"Black Lives Matter","rating":"g","alt":null,"type":"pure"}
```

Sharing a Gist to be imported by using the `url` query parameter. Example:

```javascript
/edit-jargon?preferences=1&url=https%3A%2F%2Fgist.github.com%2Fgtzilla%2Fa1450dc3b134a7c7e3a8abcb9988b52b
```


#### Opportunities to Improve

1. Shareable Jargon acronyms. If a user visits a Uniform Resource Locator (URL), which is not present
in their dictionary, allow it to be added and defined.
2. Allow users to share the entire JSON payload of a new Jargon acronym

```javascript

const shareable = '{"phrase":"Today I learned","rating":"g","alt":"TIL","type":"TIL"}';
const url = new URL('/shareable', 'https://jargonaut.app');
url.search = new URLSearchParams({
	phrasonary:shareable
});
console.log(url.toString());

```