import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  doc,
  updateDoc,
  collection,
  onSnapshot,
  setDoc,
  getDoc,
  getDocs,
  QuerySnapshot,
  DocumentChange,
} from '@angular/fire/firestore';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { DabubbleUser } from '../classes/user.class';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  public loggedInUserDataSubject = new BehaviorSubject<any>(null);
  public subscribedRecipientDataSubject = new BehaviorSubject<any>(null);
  public conversationDataSubject = new BehaviorSubject<any>(null);
  public threadDataSubject = new BehaviorSubject<any>(null);
  public pmsCollectionDataSubject = new BehaviorSubject<any>(null);
  public usersCollectionDataSubject = new BehaviorSubject<any>(null);
  public channelsCollectionDataSubject = new BehaviorSubject<any>(null);
  public conversation: any;
  private unsubUserData: Function;
  private usnubThreadDocument: Function;
  public currentChannel;
  public channels = [];
  public allUsers = [];
  public emailsForReactions = [];
  private currentDate;
  public sorted = [];
  public unsubUsers: Function;
  userOnChannelCheck = [];
  private defaultChannelCalled: boolean = false;
  public conversationId;

  constructor(private firestore: Firestore) {
    this.subscribeToCollection('pms', this.pmsCollectionDataSubject);
    this.subscribeToCollection('users', this.usersCollectionDataSubject);
    this.subscribeToCollection('channels', this.channelsCollectionDataSubject);
  }

  ngOnDestroy() {
    this.unsubUserData();
    this.unsubUsers();
    this.usnubThreadDocument();
    this.destroyConversationDataSubject();
    this.destroyThreadDataSubject();
  }

  /**
   * Retrieves and observes user data for the specified userId from Firestore.
   * Subscribes to the Firestore document changes using onSnapshot.
   * @param userId - The unique identifier of the user.
   * @returns An observable that emits the user data.
   */
  async getLogedInUserData(userId: string) {
    const docRef = this.getDocRef('users', userId);

    this.unsubUserData = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists) {
        const userData = docSnapshot.data();
        this.loggedInUserDataSubject.next(userData);
      } else return null;
    });

    return this.loggedInUserDataSubject.asObservable();
  }

  /**
   * Subscribes to changes in a Firestore collection and updates the specified subject.
   * @param col - The name of the Firestore collection.
   * @param subject - The subject to be updated with the collection data.
   */
  subscribeToCollection(col, subject) {
    const docRef = this.getColRef(col);

    onSnapshot(docRef, (snapshot: QuerySnapshot) => {
      const collectionData = snapshot.docs.map((doc) => doc.data());

      subject.next(collectionData);
    });
  }

  /**
   * Subscribes to changes in the user document with the specified userId in the 'users' collection.
   * Updates the subscribedRecipientDataSubject with the document data or null if the document doesn't exist.
   * @param userId - The unique identifier of the user.
   */
  subscribeToPmRecipient(userId: string) {
    const docRef = this.getDocRef('users', userId);

    onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const docData = snapshot.data();
        this.subscribedRecipientDataSubject.next(docData);
      } else {
        this.subscribedRecipientDataSubject.next(null);
      }
    });
  }

  /**
   * Subscribes to changes in the private messaging (PM) conversation document with the specified conversationID in the 'pms' collection.
   * Updates the conversationDataSubject with the document data or null if the document doesn't exist.
   * @param conversationID - The unique identifier of the PM conversation.
   * @throws - An error if there is an issue with the subscription.
   * @returns - A Promise that resolves when the subscription is successfully set up.
   */
  async subscribeToPMConversation(conversationID: string): Promise<void> {
    const docRef = this.getDocRef('pms', conversationID);
    this.conversationDataSubject = new BehaviorSubject<any>(null);

    onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const convData = snapshot.data();
        this.conversationDataSubject.next(convData);
      } else {
        this.conversationDataSubject.next(null);
      }
    });
  }

  /**
   * Destroys the conversationDataSubject by completing it.
   */
  private destroyConversationDataSubject(): void {
    this.conversationDataSubject.complete();
  }

  /**
   * Subscribes to a document in a specific collection (thread) and updates the threadDataSubject with the latest data.
   * @param col The name of the collection.
   * @param docId The ID of the document to subscribe to.
   * @returns A Promise that resolves when the subscription is established.
   */
  async subscribeToThreadDocument(col: string, docId: string): Promise<void> {
    const docRef = this.getDocRef(col, docId);

    this.usnubThreadDocument = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const threadData = snapshot.data();
        this.threadDataSubject.next(threadData);
      } else {
        this.threadDataSubject.next(null);
      }
    });
  }

  /**
   * Destroys the threadDataSubject by completing it.
   */
  private destroyThreadDataSubject(): void {
    this.threadDataSubject.complete();
  }

  /**
   * Adds a new conversation to the 'pms' collection in Firestore.
   * @param data The data to be added to the conversation document.
   */
  async addNewConversation(data: {}) {
    const colRef = this.getColRef('pms');

    await addDoc(colRef, data);
  }

  /**
   * Updates a conversation document in the specified collection in Firestore.
   * @param col The name of the collection containing the conversation document.
   * @param conversationID The ID of the conversation document to be updated.
   * @param data The updated data to be set in the conversation document.
   */
  async updateConversation(col: string, conversationID: string, data: {}) {
    const docRef = this.getDocRef(col, conversationID);

    await setDoc(docRef, data);
  }

  /**
   * Retrieves a snapshot of the 'pms' collection from Firestore.
   * @returns A Promise that resolves with the snapshot of the 'pms' collection.
   */
  async getPmsSnapshot() {
    const colRef = this.getColRef('pms');

    return await getDocs(colRef);
  }

  /**
   * Adds or updates user data in the 'users' collection in Firestore.
   * @param data - The user data to be added or updated.
   * @param userId - The unique identifier for the user.
   */
  async newUser(data: {}, userId: string) {
    const userRef = this.getDocRef('users', userId);
    await setDoc(userRef, data);
  }

  /**
   * Retrieves a reference to a Firestore collection with the specified name.
   * @param colName - The name of the collection.
   * @returns A reference to the Firestore collection.
   */
  getColRef(colName: string) {
    return collection(this.firestore, colName);
  }

  /**
   * Retrieves a reference to a Firestore document with the specified ID within the given collection.
   * @param colName - The name of the collection containing the document.
   * @param docId - The ID of the document to retrieve.
   * @returns A reference to the Firestore document.
   */
  getDocRef(colName: string, docId: string) {
    return doc(this.getColRef(colName), docId);
  }

  /**
   * Retrieves the current channel data from Firestore.
   * @param colName - The name of the collection containing the channel.
   * @param docId - The ID of the channel document to retrieve.
   */
  async getCurrentChannel(colName: string, docId: string) {
    const channelRef = await getDoc(this.getDocRef(colName, docId));
    if (channelRef.exists()) {
      this.currentChannel = channelRef.data();
      this.currentChannel.messages = channelRef.data()['messages'];
    } else {
      console.error('Document does not exist');
      return null;
    }
  }

  /**
   * Updates the current channel document in Firestore with the latest data.
   * @returns A Promise that resolves when the document update is successful.
   */
  async updateDocumentInFirebase() {
    await updateDoc(
      this.getDocRef('channels', this.currentChannel.id),
      this.currentChannel.toJson()
    );
  }

  /**
   * Reads channel changes from Firestore and processes them.
   * Initializes a Firestore query and registers an onSnapshot listener for channel updates.
   */
  async readChannels() {
    this.defaultChannelCalled = false;
    const colRef = this.getColRef('channels');

    // Subscribe to snapshot changes in the 'channels' collection
    let unsubscribe = onSnapshot(colRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        this.processChannelChange(change);
      });

      // Handle processing of the default channel
      this.handleDefaultChannel();
    });
  }

  /**
   * Processes changes for an individual channel in the snapshot.
   *
   * @param {DocumentChange} change - The change object representing a channel modification.
   */
  processChannelChange(change: DocumentChange) {
    const channelToModifyIndex = this.channels.findIndex(
      (channel) => channel.index === change.doc.data()['index']
    );

    if (change.type === 'added') {
      this.handleAddedChannel(channelToModifyIndex, change);
    }

    if (change.type === 'modified') {
      this.handleModifiedChannel(channelToModifyIndex, change);
    }
  }

  /**
   * Handles the case when a new channel is added.
   *
   * @param {number} channelToModifyIndex - Index of the channel to modify in the local channels list.
   * @param {DocumentChange} change - The change object representing an added channel.
   */
  handleAddedChannel(channelToModifyIndex: number, change: DocumentChange) {
    if (channelToModifyIndex === -1) {
      this.channels.push(change.doc.data());
      this.checkIfUserOnChannel();
    }
  }

  /**
   * Handles the case when an existing channel is modified.
   *
   * @param {number} channelToModifyIndex - Index of the channel to modify in the local channels list.
   * @param {DocumentChange} change - The change object representing a modified channel.
   */
  handleModifiedChannel(channelToModifyIndex: number, change: DocumentChange) {
    this.channels[channelToModifyIndex] = change.doc.data();
    if (
      this.currentChannel &&
      this.currentChannel.index === this.channels[channelToModifyIndex].index
    ) {
      this.currentChannel = this.channels[channelToModifyIndex];
    }
    this.checkIfUserOnChannel();
  }

  /**
   * Handles the case when the default channel needs to be processed.
   */
  handleDefaultChannel() {
    if (!this.defaultChannelCalled && this.channels.length > 0) {
      this.defaultChannel();
      this.defaultChannelCalled = true;
    }
  }

  /**
   * Checks if the logged-in user is on each channel in the channels array.
   */
  async checkIfUserOnChannel() {
    let userId: string;
    this.loggedInUserDataSubject
      .pipe(distinctUntilChanged())
      .subscribe((data) => {
        if (data && data.userId) {
          userId = data.userId;
          this.userOnChannelCheck = [];
          this.channels.forEach((channel) => {
            let index = channel.users.find(
              (user: DabubbleUser) => user.userId === userId
            );
            if (channel.name === 'Backend') {
              if (index !== undefined) {
                this.userOnChannelCheck.push(true);
              } else {
                this.userOnChannelCheck.push(false);
              }
            } else {
              this.userOnChannelCheck.push(true);
            }
          });
        }
      });
  }

  /**
   * Sets the current channel to the default channel named 'Entwickler' if it exists in the channels array.
   */
  async defaultChannel() {
    if (this.channels.length > 0) {
      let index = this.channels.findIndex(
        (channel) => channel.name === 'Entwickler'
      );
      this.currentChannel = this.channels[index];
    }
  }

  /**
   * Reads all users from the 'users' collection in Firestore and updates the 'allUsers' array.
   */
  async readAllUsers() {
    const colRef = this.getColRef('users');

    this.unsubUsers = onSnapshot(colRef, (snapshot) => {
      this.allUsers = [];

      snapshot.forEach((user) => {
        this.allUsers.push(user.data());
      });
    });
  }

  /**
   * Checks if the given creation date is the current date.
   * If it is, returns 'heute'; otherwise, returns the formatted creation date.
   * @param creationDay The day of the week.
   * @param creationDate The date to check.
   * @returns A formatted string indicating the creation date or 'heute' if it's the current date.
   */
  dateNameChecker(creationDay, creationDate) {
    if (creationDate !== this.getCurrentDate()) {
      return `${creationDay}, ` + `${creationDate}`;
    } else {
      return 'heute';
    }
  }

  /**
   * Gets the current date in the format 'dd.mm.yyyy'.
   * @returns The current date as a formatted string.
   */
  getCurrentDate() {
    let datetime = new Date();
    const dayName = this.getDaysName();
    this.currentDate =
      datetime.getDate() +
      '.' +
      (datetime.getMonth() + 1) +
      '.' +
      datetime.getFullYear();

    return this.currentDate;
  }

  /**
   * Gets the current time in the format 'hh:mm'.
   * @returns The current time as a formatted string.
   */
  getCurrentTime() {
    let datetime = new Date();
    let hours = datetime.getHours();
    let minutes = datetime.getMinutes();
    let formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    let currentTime = `${hours}:${formattedMinutes}`;
    return currentTime;
  }

  /**
   * Gets the name of the current day.
   * @returns The name of the current day as a string.
   */
  getDaysName() {
    const weekday = [
      'Sonntag',
      'Montag',
      'Dienstag',
      'Mittwoch',
      'Donnerstag',
      'Freitag',
      'Samstag',
    ];
    const d = new Date();
    let day = weekday[d.getDay()];
    return day;
  }
}
