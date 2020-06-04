# Jargonaut.app

Jargonaut.app -> The personal Jargon solving game. Start with our shared acronym glossary. Add your own, private, jargon. Jargon is stored locally via indexDb
This is a Github Single Page Application. It relies on naming the primary file `404.html` so that Github will serve this for any not found URL. Any found URLs are returned.

## Deploy

Deploy by pushing to gh-pages. Run the `bash deploy-github.sh`


#### Subtle Opportinuties to improve

if a user loads and the 'nextUp' sticky word
doesnt get pruned


### Edge cases

+ Federal Bureau of Investigation -> FBI not FBOI
+ Food and Drug Administration -> FDA not FADA


#### Installing and using CSS linting 

```sh
yarn add stylelint stylelint-config-standard
```
Create a `.stylelintrc.json` file with 

```json
{
  "extends": "stylelint-config-standard"
}
```

```sh
yarn stylelint static/css/*.css
```

##### References

1. https://stylelint.io/user-guide/get-started
1. https://www.a2hosting.com/kb/developer-corner/mysql/managing-mysql-databases-and-users-from-the-command-line


