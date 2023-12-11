export class Channel {
  name: string;
  description: string;
  users: any[] = [];
  id;
  messages = [];
  createdBy: string
  constructor(obj?: any) {
    this.name = obj?.name || '';
    this.description = obj?.description || '';
    this.users = obj?.users || [];
    this.messages = obj?.messages || [];
    this.id = obj?.id || '';
    this.createdBy = obj?.createdBy || ''
  }

  toJSON() {
    const messagesAsJson = this.messages.map((message) => {
      return message.toJSON();
    });

    return {
      name: this.name,
      description: this.description,
      users: this.users,
      messages: messagesAsJson,
      id: this.id,
      createdBy: this.createdBy
    };
  }
}
