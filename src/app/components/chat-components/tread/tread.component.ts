import { Component } from '@angular/core';
import { HomeNavigationService } from 'src/app/services/home-navigation.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Message } from 'src/app/classes/message.class';
import { Subject, takeUntil } from 'rxjs';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Conversation } from 'src/app/classes/conversation.class';
import { Channel } from 'src/app/classes/channel.class';

@Component({
  selector: 'app-tread',
  templateUrl: './tread.component.html',
  styleUrls: ['./tread.component.scss'],
})
export class TreadComponent {
  public sendMessageForm: FormGroup;
  public messages: Message[];
  private destroy$ = new Subject<void>();
  public type = 'thread';
  public opendThreadConversation: Conversation | Channel;
  public threadCollection: string;
  public parentMessage: Message = new Message();

  constructor(
    public homeNav: HomeNavigationService,
    private fb: FormBuilder,

    private firestoreService: FirestoreService
  ) {
    this.sendMessageForm = this.fb.group({
      message: ['', [Validators.required]],
    });

    this.subMessageData();
  }

  noOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get message() {
    return this.sendMessageForm.get('message');
  }

  subMessageData() {
    this.homeNav.selectedMessageSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.parentMessage = data;
        this.subThreadData();
      });
  }

  subThreadData() {
    this.firestoreService.threadDataSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          if (this.isConversation(data)) {
            this.opendThreadConversation = new Conversation(data);
            this.threadCollection = 'pms';
          } else if (this.isChannel(data)) {
            this.opendThreadConversation = new Channel(data);
            this.threadCollection = 'channels';
          }
          this.updateCurrentMessage();
        }
      });
  }

  isConversation(data: {}) {
    return 'userId1' in data && 'userId2' in data && 'messages' in data;
  }

  isChannel(data: {}) {
    return 'name' in data && 'description' in data;
  }

  updateCurrentMessage() {
    this.opendThreadConversation.messages.forEach(
      (message: Message, index: number) => {
        this.opendThreadConversation.messages[index] = new Message(message);

        if (message.id === this.parentMessage.id) {
          this.parentMessage = message;
        }
      }
    );
  }
}