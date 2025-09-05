export class FrontApplication {
  constructor(private uid: string) {}

  get id() {
    return this.uid
  }

  toJSON(): { uid: string } {
    return { uid: this.uid }
  }
}
