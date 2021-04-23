# form-rocket :rocket:

Experimental library for managing almost static forms.

## Basic design principles

- There is no silver bullet for form managment so you must choose/implement solutions that fit your needs.
- To be performant form managment library must use Observable pattern (like [final form](https://final-form.org/)). You don't need caches (reselect, PureComponent, memo), if changes in few controls trigger only relevant update logic.
- Form managment library must have expressive and powerful framework agnostic core. This is greatly simplify testing and also tends to the more pure code structure.
