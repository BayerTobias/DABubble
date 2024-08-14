import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateChannelComponent } from '../../chat-components/channel-components/create-channel/create-channel.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { HomeNavigationService } from 'src/app/services/home-navigation.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {
  @Output() booleanChanged = new EventEmitter<boolean>();

  constructor(
    public dialog: MatDialog,
    public fireService: FirestoreService,
    private navService: HomeNavigationService
  ) {}
  async ngOnInit() {
    this.fireService.readChannels();
  }
  clickedOnMobile = false;
  channelsClicked = true;
  PMclicked = true;

  /**
   * Toggles the value of the channelsClicked property.
   */
  openChannels() {
    this.channelsClicked = !this.channelsClicked;
  }

  /**
   * Toggles the value of the PMclicked property.
   */
  openPM() {
    this.PMclicked = !this.PMclicked;
  }

  /**
   * opens a chat channel identified by the given id.
   * Updates some properties and invokes methods from the 'fireService' and 'navService'.
   * Emits a boolean value through the 'booleanChanged' event.
   * @param id - The id of the chat channel.
   */
  async openChanelChat(id: string) {
    this.clickedOnMobile = true;
    this.booleanChanged.emit(this.clickedOnMobile);
    await this.fireService.getCurrentChannel('channels', id);
    this.fireService.getCurrentDate();
    this.navService.setChatPath('chanel');
    this.navService.triggerFocus();
  }

  /**
   * Opens a dialog for creating a channel.
   * Uses Angular Material's dialog service to create and display the dialog.
   */
  openCreateChannelDialog(): void {
    const dialogRef = this.dialog.open(CreateChannelComponent, {
      height: '400px',
      width: '600px',
      maxWidth: '100vw',
      panelClass: 'createChannelDialog',
    });
  }

  /**
   * Opens a private chat (PM) with the specified user.
   * Updates properties and subscribes to the private chat recipient using 'fireService' and 'navService'.
   * Emits a boolean value through the 'booleanChanged' event.
   * @param userId - The ID of the user to initiate a private chat with.
   */
  openPmChat(userId: string) {
    this.clickedOnMobile = true;
    this.booleanChanged.emit(this.clickedOnMobile);
    this.navService.pmRecipient = userId;
    this.navService.setChatPath('pm');
    this.fireService.subscribeToPmRecipient(userId);
    this.navService.triggerFocus();
  }
}
