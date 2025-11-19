### §3.5 Tool Bar

- Color scheme
  - Background: `#31363f`
  - Icons: `#eeeeee`
- There will be two tools bars
  - Parsing Mode - When in parsing mode, all icons to the right of the vertical divider should be tied to parsing actions: New Text, Parsing, Editing, Creating Flashcard from sentence, Save, and History
  - Flaschard Mode - When in flashcard mode, all icons to the right of the vertical divider should be tied to flashcard actions: Creating, Filtering, Save, and History
  - There is to be a center, vertical divider:
    - To the left will be the icons: `Abc.svelte` and `Flaschard.Mode.svelte`
    - To the right will be the icons only needed for the mode the user is in.
  - Layout Schema:
    - Centering: use flex; justify content; to center all content
    - Adaptive Background/Padding: To create a "one-icon-width" padding (24px) around the entire group of icons, make sure the inner div uses the background color provided above and px-6
    - Mode Switch Highlight: To highlight the current mode of the fixed icons, use an active background style color `#76abae`
    - Dynamic Right Side: the icon group on the right is to be rendered conditionally using mode ==='parsing' and mode ==='flashcard', ensuring the number of elements and the visual width adapt instantly when the mode button is clicked.
