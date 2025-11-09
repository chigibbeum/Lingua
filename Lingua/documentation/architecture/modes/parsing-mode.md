#### §1.1 Parsing Mode
- In the mode the user must be able to enter, edit, parse, and save text. 
- Main Features: 
  - Entering and submitting text
  - Text color should be `#eeeeee`
  - Inline tokenized text with contextual hightling. Hightlighting should be in `#31363f`
  - Editing already inputed text. 
  - Saving text into its own file which can be organized by date of creation and a tagging system. 
- In the center of the page will be a text box following this design: 
  - No surrounding box or background 
  - Next to the cursor, show the prompt 'insert text' in the secondary text color 
  - The cursor should be clearly visible and ready for typing.
  - Text is submitted via the "enter" button, when the user moves into a different action, or slicking the `CheckSubmit.svlete` icon
  - After submitting the new text, the cursor should disappear. 
  - Use inline tokenized text with contextual highlighting. 

#### §1.1 Parsing Mode Functions
- When switching between the actions, the layout should match the seamless transition that is explained under the §3.5 Tool Bar guidelines
- Within the parsing mode there are 6 actions: 
 - Add New Text
 - Parse Text
 - Edit Text
 - Create Flashcard
 - Save Notes
 - View History 
- When creating the svelte component for these actions name them according to the action plus the word "action' (i.e. AddNewTextFunction.svelte)
 1: Add new text (icon NewText.svelte)
    - upon start up of the app,this is the defualt page
    - when the user is in the middle of or done parsing, clicking this icon will bring back to parsing mode default page 
    - before starting a new text, the user should be prompted to save the text or continue without saving
    - the user can submit text either by pressing enter on the keyboard, of clicking submit 
      - Submit should be a button with no background (not an icon)
      - The text should read submit 
      - The submit button should only appear, after the user starts typing
    - Text is submitted using the inline tokenized text with contextual hightlighting. . 
    - Automatically switch to parsing action 
  2: Parse text (icon ParseText.svelete)
    - This is the bulk of where the action happens. Here the user can break up text nodes, combine text nodes, and take notes for each text node. 
    - when hovering over or single clicking a node, a popover appears above the node giving the user two options: break and add note:
      - Use `Break.svelte` for the break icon
      - Use `AddNote.svelte` for the add note icon 
    - When highlighting two or more nodes, a box should appear above the node giving the user two options: combine and add note: 
      - Use `Combind.svelte` for the combine icon 
      - Use `AddNote.svelte` for the add note icon
    - When a user wants to break a node, a cursor should appeaer in the node and the user can select where they want to break the node. Either they can (1) press space or (2) press enter to break the node. The node will always break where the cursor is at. 
    - When a user wants to combine two or more nodes, they must highlight the nodes they want combined. The text should remain properly spaced between the words, but it should now appear under one node. 
    - When a user wants to add a note, a modal should appear called `AddNoteModal.svelte` that allows the user to add a note. (More direction for this modal is given under the modal section in this file)
    - After adding a note, an "n" should appear in the top right corner of the node to indicate that a note was added. The text color should #76abae
    - Once a note has been added to a word, the background should remain `#31363f`
  3: Edit Text (icon `EditText.svelte`)
    - In this action the user can go back and edit the text they orginally submitted. However rather than going back to a text box, each text node becomes an editable text node. 
    - When the user single clicks a  text node, a pop up shows above the node. In this pop up a text box with three icons appear: 
      - `InsertLeft.svelte` - the user can add a text node to the left of the node they clicked
      - `InsertRight.svelete ` - the user can add a text node to the right of the node they clicked 
      - `EditNode.svelte` - the user can edit the text in the node they clicked 
 4: Create Flashcards (icon `CreateFlashcards.svelete`)
  - Based on the vocabulary notes the user made, create them into flashcards
 5: Save Notes ( icon `SaveNote.svelte`)
  - This action saves the text and notes the user made on the text nodes. 
  - A modal appears where the user can enter a title for the sentence, tag the sentence, and add a created date.
6: View History (icon `HistoryView.svelte)
 - This action allows the user to view all changes and additions made to the sentence.