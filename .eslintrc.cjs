module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    extends: [
        'semistandard'
    ],
    settings:{
    },    
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": false
        },
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "globals":{
      React:true,
      ReactDOM:true,
      "_": 'readonly'
    },
    "rules": {
        "id-length": ["error", { "min": 2 }],
        "multiline-ternary": ["error", "never"]
    }
};