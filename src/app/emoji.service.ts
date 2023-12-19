import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {
  currentMessage;

  constructor() { }

  async addEmoji() {
    let indexOfCurrentMessage;
    let docReference;
    /*     this.addEmojiEvent.emit(event); */
    if (this.type === 'channel') {
      /*    indexOfCurrentMessage =
           this.fireService.currentChannel.messages.findIndex(
             (message) => message.id === this.currentMessage.id
           ); //to find the message to change  */
      docReference = this.fireService.getDocRef(
        'channels',
        this.fireService.currentChannel.id
      );
    }
    if (this.type === 'pm') {
      /* indexOfCurrentMessage =
       this.conversation.messages.reverse()[this.index]
     this.conversation.messages.findIndex(
       (message) => message.id === this.currentMessage.id
     ); //to find the message to change */

      docReference = this.fireService.getDocRef('pms', this.collectionId);

    }

    this.createEmoji(event);
    let indexOfEmoji = this.currentMessage.reactions.findIndex(
      (reaction) => reaction.id === this.emoji.id
    ); //I check if the selected emoji already exists on the message
    this.checkForEmoji(indexOfEmoji);
    //I change the selected message
    if (this.type === 'channel') {
      this.fireService.currentChannel.messages[this.index] =
        this.currentMessage;
      await updateDoc(docReference, {
        messages: this.fireService.currentChannel.messages,
      });
    }
    if (this.type === 'pm') {
      this.conversation.messages[this.index] = this.currentMessage;
      await updateDoc(docReference, {
        messages: this.conversation.toJSON().messages,
      });
    }
    this.openEmoji()
  }

  createEmoji(event) {
    this.emoji = new Reaction({
      id: event.emoji.id,
      name: event.emoji.name,
      colons: event.emoji.colons,
      text: event.emoji.text,
      emoticons: event.emoji.emoticons,
      skin: event.emoji.skin,
      native: event.emoji.native,
      counter: 1,
    });
  }

  checkForEmoji(indexOfEmoji) {
    if (indexOfEmoji === -1) {
      this.ifEmojiIsNotOnMessage(indexOfEmoji);
    } else if (this.currentMessage.reactions[indexOfEmoji].counter !== 0) {
      this.ifEmojiIsOnMessage(indexOfEmoji);
    }
  }

  ifEmojiIsNotOnMessage(indexOfEmoji) {
    this.currentMessage.reactions.push(this.emoji.toJSON());
    indexOfEmoji = this.currentMessage.reactions.findIndex(
      (reaction) => reaction.id === this.emoji.id
    );
    this.currentMessage.reactions[indexOfEmoji].userIDs.push(
      this.userService.user.userId
    );
  }

  ifEmojiIsOnMessage(indexOfEmoji) {
    if (this.checkForUsersIdForEmoji(indexOfEmoji) === -1) {
      this.increaseCounterOfExistingEmoji(indexOfEmoji);
      this.currentMessage.reactions[indexOfEmoji].userIDs.push(
        this.userService.user.userId
      );
    } else {
      this.currentMessage.reactions[indexOfEmoji].userIDs.splice(
        this.checkForUsersIdForEmoji(indexOfEmoji),
        1
      );
      this.decreaseCounterOfExistingEmoji(indexOfEmoji);
      if (this.currentMessage.reactions[indexOfEmoji].counter === 0)
        this.removeEmojiIfCounter0(indexOfEmoji);
    }
  }

  increaseCounterOfExistingEmoji(indexOfEmoji) {
    return this.currentMessage.reactions[indexOfEmoji].counter++;
  }

  decreaseCounterOfExistingEmoji(indexOfEmoji) {
    return this.currentMessage.reactions[indexOfEmoji].counter--;
  }

  removeEmojiIfCounter0(indexOfEmoji) {
    this.currentMessage.reactions.splice(indexOfEmoji, 1);
  }

  checkForUsersIdForEmoji(indexOfEmoji) {
    return this.currentMessage.reactions[indexOfEmoji].userIDs.findIndex(
      (id) => id === this.userService.user.userId
    );
  }
}