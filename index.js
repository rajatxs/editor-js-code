import { IconBrackets } from '@codexteam/icons';
import { getLineStartPosition } from './utils/string';
import './index.css';

/**
 * Custom CodeTool for Editor.js
 * @author Rajat Sharma (rxx256@outlook.com)
 * @license ISC
 * @version 0.0.1
 */

/**
 * @typedef CodeConfig
 * @property {string} [placeholder] - Placeholder string
 * @property {Record<string, string>} [modes] - Code highlight modes
 * @property {string} [defaultMode] - Default selected mode property
 */

/**
 * @typedef {object} CodeData — plugin saved data
 * @property {string} code - previously saved plugin code
 * @property {string} mode - Selected mode of provided code
 */

/**
 * Code Tool for the Editor.js allows to include code examples in your articles.
 */
export default class CodeTool {
   /** @type {Record<string, string>} */
   modes = {};

   /**
    * Notify core that read-only mode is supported
    * @returns {boolean}
    */
   static get isReadOnlySupported() {
      return true;
   }

   /**
    * Allow to press Enter inside the CodeTool textarea
    * @returns {boolean}
    * @public
    */
   static get enableLineBreaks() {
      return true;
   }

   /**
    * Render plugin`s main Element and fill it with saved data
    * @param {object} options - tool constricting options
    * @param {CodeData} options.data — previously saved plugin code
    * @param {CodeConfig} options.config - user config for Tool
    * @param {object} options.api - Editor.js API
    * @param {boolean} options.readOnly - read only mode flag
    */
   constructor({ data, config, api, readOnly }) {
      /** @type {string} */
      let selectedMode;

      this.api = api;
      this.readOnly = readOnly;
      this.placeholder = this.api.i18n.t(config.placeholder || CodeTool.DEFAULT_PLACEHOLDER);
      this.modes = config.modes || {
         text: CodeTool.DEFAULT_MODE_LABEL,
      };

      if (typeof config.defaultMode === 'string') {
         selectedMode = config.defaultMode;

         if (!this.modes[config.defaultMode]) {
            console.warn(
               '[@rxpm:editor-js-code] Missing default mode value in plugin configuration',
            );
            selectedMode = CodeTool.DEFAULT_MODE_KEY;
         }
      } else {
         selectedMode = Object.keys(this.modes)[0];
      }

      this.CSS = {
         baseClass: this.api.styles.block,
         input: this.api.styles.input,
         wrapper: 'ce-code',
         textarea: 'ce-code__textarea',
         selector: 'rxpm-code__selector',
      };

      /** @type {Record<string, any>} */
      this.nodes = {
         holder: null,
         selector: null,
         textarea: null,
      };

      this.data = {
         code: data.code || '',
         mode: data.mode || selectedMode,
      };

      this.nodes.holder = this.drawView();
   }

   /**
    * Create Tool's view
    * @returns {HTMLElement}
    * @private
    */
   drawView() {
      // create container
      const wrapper = document.createElement('div');
      wrapper.classList.add(this.CSS.baseClass, this.CSS.wrapper);

      //  prepare selector view
      const selector = document.createElement('select');
      selector.classList.add(this.CSS.selector);
      for (const modeKey in this.modes) {
         const opt = document.createElement('option');
         opt.value = modeKey;
         opt.textContent = this.modes[modeKey];
         selector.appendChild(opt);
      }
      selector.value = this.data.mode;

      //  prepare text area
      const textarea = document.createElement('textarea');
      textarea.classList.add(this.CSS.textarea, this.CSS.input);
      textarea.textContent = this.data.code;
      textarea.placeholder = this.placeholder;

      if (this.readOnly) {
         selector.disabled = true;
         textarea.disabled = true;
      }

      wrapper.appendChild(selector);
      wrapper.appendChild(textarea);

      //  listen mode change event
      selector.addEventListener('change', (event) => {
         // @ts-ignore
         this.data.mode = event.target.value;
      });

      // Enable keydown handlers
      textarea.addEventListener('keydown', (event) => {
         switch (event.code) {
            case 'Tab':
               this.tabHandler(event);
               break;
         }
      });

      this.nodes.selector = selector;
      this.nodes.textarea = textarea;
      return wrapper;
   }

   /**
    * Return Tool's view
    * @public
    * @returns {HTMLDivElement} this.nodes.holder - Code's wrapper
    */
   render() {
      return this.nodes.holder;
   }

   /**
    * Extract Tool's data from the view
    * @param {HTMLDivElement} codeWrapper - CodeTool's wrapper, containing textarea with code
    * @returns {CodeData} - saved plugin code
    * @public
    */
   save(codeWrapper) {
      return {
         // @ts-ignore
         code: codeWrapper.querySelector('textarea').value,
         mode: this.data.mode,
      };
   }

   /**
    * onPaste callback fired from Editor`s core
    * @param {any} event - event with pasted content
    */
   onPaste(event) {
      const content = event.detail.data;

      this.data = {
         code: content.textContent,
         mode: this.data.mode,
      };
   }

   /**
    * Returns Tool`s data from private property
    * @returns {CodeData}
    */
   get data() {
      // @ts-ignore
      return this._data;
   }

   /**
    * Set Tool`s data to private property and update view
    *
    * @param {CodeData} data - saved tool data
    */
   set data(data) {
      this._data = data;

      if (this.nodes.textarea) {
         this.nodes.textarea.textContent = data.code;
      }
   }

   /**
    * Get Tool toolbox settings
    * icon - Tool icon's SVG
    * title - title to show in toolbox
    *
    * @returns {{icon: string, title: string}}
    */
   static get toolbox() {
      return {
         icon: IconBrackets,
         title: 'Code',
      };
   }

   /**
    * Default placeholder for CodeTool's textarea
    * @public
    * @returns {string}
    */
   static get DEFAULT_PLACEHOLDER() {
      return 'Enter a code';
   }

   /**
    * Default language mode key
    * @public
    * @returns {string}
    */
   static get DEFAULT_MODE_KEY() {
      return 'text';
   }

   /**
    * Default language mode label
    * @public
    * @returns {string}
    */
   static get DEFAULT_MODE_LABEL() {
      return 'Plain Text';
   }

   /**
    *  Used by Editor.js paste handling API.
    *  Provides configuration to handle CODE tag.
    *
    * @static
    * @returns {{tags: string[]}}
    */
   static get pasteConfig() {
      return {
         tags: ['pre'],
      };
   }

   /**
    * Automatic sanitize config
    *
    * @returns {{code: boolean}}
    */
   static get sanitize() {
      return {
         code: true, // Allow HTML tags
      };
   }

   /**
    * Handles Tab key pressing (adds/removes indentations)
    *
    * @private
    * @param {KeyboardEvent} event - keydown
    * @returns {void}
    */
   tabHandler(event) {
      /**
       * Prevent editor.js tab handler
       */
      event.stopPropagation();

      /**
       * Prevent native tab behaviour
       */
      event.preventDefault();

      /** @type {any} */
      const textarea = event.target;
      const isShiftPressed = event.shiftKey;
      const caretPosition = textarea.selectionStart;
      const value = textarea.value;
      const indentation = '  ';

      let newCaretPosition;

      /**
       * For Tab pressing, just add an indentation to the caret position
       */
      if (!isShiftPressed) {
         newCaretPosition = caretPosition + indentation.length;

         textarea.value =
            value.substring(0, caretPosition) + indentation + value.substring(caretPosition);
      } else {
         /**
          * For Shift+Tab pressing, remove an indentation from the start of line
          */
         const currentLineStart = getLineStartPosition(value, caretPosition);
         const firstLineChars = value.substr(currentLineStart, indentation.length);

         if (firstLineChars !== indentation) {
            return;
         }

         /**
          * Trim the first two chars from the start of line
          */
         textarea.value =
            value.substring(0, currentLineStart) +
            value.substring(currentLineStart + indentation.length);
         newCaretPosition = caretPosition - indentation.length;
      }

      /**
       * Restore the caret
       */
      textarea.setSelectionRange(newCaretPosition, newCaretPosition);
   }
}
