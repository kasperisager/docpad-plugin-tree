# Tree plugin for [DocPad](http://docpad.org/)

[DocPad](http://docpad.org/) plugin that when given a collection will construct a hierarchical tree of documents. Perfect for navigation menus!

## Install

```sh
$ docpad install tree
```

## Usage

The plugin exposes a template helper, `tree(collection, context)`, that you can use for constructing a tree of documents from any given collection:

`tree(...)`  | Type     | Description
---          | ---      | ---
`collection` | `string` | The name of the collection used for constructing the tree. Default: `documents`
`context`    | `object` | The context in which this tree is to be constructed. Will "highlight" the current document path if set. You'll typically want to set it to `@document`. _Optional_

For each document in the collection, you can set the following meta information:

```yml
title: "Fishing with my uncle" # Title of the page
menu: "Fishing tricks"         # Title that will appear in the tree (optional)
order: 0                       # Sort order
hidden: false                  # Whether or not to hide the item from the tree
```

A constructed tree will look something like this:

```json
[
  {
    "title": "Some Page",
    "url": "/some-page",
    "order": 0,
    "hidden": false,
    "children": [
      {
        "title": "A child page",
        "url": "/some-page/a-child-page",
        "order": 0,
        "hidden": false
      }
    ]
  },
  {
    "title": "Current page",
    "url": "/current-page",
    "order": 0,
    "hidden": false,
    "active": true
  }
]
```

The tree can then be used to create a nested navigation menu:

```eco
<% menu = (items) => %>
  <ul class="nav nav-stacked">
    <% for item in items: %>
      <li<%= " class=active" if item.active %>>
        <a href="<%= item.url %>"><%= item.title %></a>
        <%- menu item.children if item.children %>
      </li>
    <% end %>
  </ul>
<% end %>

<%= menu @tree('html', @document) %>
```

---
Copyright &copy; 2014 [Kasper Kronborg Isager](https://github.com/kasperisager). Licensed under the terms of the [MIT License](LICENSE.md).
