import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatMessage, ChatService } from '../chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit , OnDestroy{
  form: FormGroup
  action: String = "Join"
  messages: ChatMessage[] = []
  event$: Subscription
  constructor(private fb: FormBuilder, private chatSvc: ChatService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: this.fb.control('', [Validators.required]),
      message: this.fb.control('', [Validators.required])
    })
  }

  postMsg() {
    const message = this.form.get('message').value
    console.log(message)
    this.form.get('message').reset()
    this.chatSvc.sendMessage(message)
  }
  toggleConnection() {
    if (this.action == "Join") {
      this.action = "Leave"
      const name = this.form.get('name').value
      this.chatSvc.join(name)
      //event.subscribe needs to be after joining
      //track the event subscription using a Subscription this.event$
      this.event$ = this.chatSvc.event.subscribe(chat => {
        this.messages.unshift(chat)
      })
    } else {
      this.action = 'Join'
      this.chatSvc.leave()
      this.event$.unsubscribe()
      this.event$ = null
    }
  }

  ngOnDestroy(){
    //check if we are connected before unsubcribing 
    if (this.event$ != null ) {
      this.event$.unsubscribe
      this.event$ = null
    }
   
  }
}
