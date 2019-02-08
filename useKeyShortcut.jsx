import React from 'react';

export class KeyCenter {
   constructor() {
      // keys we're listening for
      this.listeningFor = {};

      // possible key modifiers
      this.modifierKeys = ['altKey', 'ctrlKey', 'shiftKey', 'metaKey'];

      // number of registered listeners (for listener ID)
      this.listenerCount = 0;

      this.keyDown = this.keyDown.bind(this);
      this.addListener = this.addListener.bind(this);
      this.removeListener = this.removeListener.bind(this);

      // global key listener
      if (typeof document !== 'undefined') {
         document.addEventListener('keydown', this.keyDown, false);
      }
   }

   keyDown(e) {
      if (e.key in this.listeningFor) {
         let stopBubble = false;
         this.listeningFor[e.key].forEach((k) => {
            let ignore = false;
            if (!stopBubble) {
               this.modifierKeys.forEach((modType) => {
                  if (k[modType] !== null && k[modType] !== e[modType]) {
                     ignore = true;
                  }
               });
               if (!ignore) {
                  if (k.preventDefault) {
                     e.preventDefault();
                  }
                  if (k.stopPropagation) {
                     e.stopPropagation();
                     stopBubble = true;
                  }
                  if (typeof k.callback === 'function') {
                     k.callback.call(null);
                  }
               }
            }
         });
      }
   }

   addListener(
      key,
      callback,
      modifiers,
      preventDefault = false,
      stopPropagation = false
   ) {
      const id = ++this.listenerCount;

      const modifierDefaults = {};
      this.modifierKeys.forEach((k) => {
         modifierDefaults[k] = false;
      });

      const keyData = {
         ...modifierDefaults,
         ...modifiers,
         modifiers,
         id,
         key,
         callback,
         preventDefault,
         stopPropagation,
      };

      if (key in this.listeningFor) {
         this.listeningFor[key].unshift(keyData);
      } else {
         this.listeningFor[key] = [keyData];
      }
      return id;
   }

   removeListener(id) {
      const ids = Array.isArray(id) ? id.slice() : [id];
      Object.entries(this.listeningFor).forEach(([keyLabel, keyList]) => {
         this.listeningFor[keyLabel] = keyList.filter(
            (key) => !ids.includes(key.id)
         );
      });
   }
}

export const keyCenter = new KeyCenter();

/**
 * A react hook to add a keyboard shortcut.
 * @param {object} key info
 */
export function useKeyShortcut({
   key,
   action,
   modifiers = {
      altKey: false,
      ctrlKey: false,
      shiftKey: false,
      metaKey: false,
   },
   preventDefault = false,
   stopPropagation = false,
}) {
   React.useEffect(() => {
      const id = keyCenter.addListener(
         key,
         action,
         modifiers,
         preventDefault,
         stopPropagation
      );
      return () => {
         keyCenter.removeListener(id);
      };
   }, []);
}
