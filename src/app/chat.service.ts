import {Injectable} from '@angular/core'
import {HttpParams} from '@angular/common/http'
import { Subject } from 'rxjs'

export interface ChatMessage {
    from: string,
    message: string,
    timestamp: string
}
@Injectable()
export class ChatService{
    private sock: WebSocket
    event = new Subject<ChatMessage> ()

    join(name: string){
        const params = new HttpParams().set('name',name)
        this.sock = new WebSocket(`ws://localhost:3000/chat?${params.toString()}` )
        this.sock.onclose = ((err)=> {
            if(this.sock != null){
                this.sock.close()
                this.sock = null
            }
           
        }).bind(this)
        //handle incoming message
        this.sock.onmessage = (payload: MessageEvent) => {
            //parse the string to ChatMessage
            const chat = JSON.parse(payload.data) as ChatMessage
            this.event.next(chat)
        }
        this.sock.onclose = () => {
            if (this.sock != null) {
            this.event.next()
              this.sock.close()
              this.sock = null
            }
          }
    
    }

    leave(){
        if (this.sock != null){
            this.sock.close()
            this.sock = null
        }
        
    }

    sendMessage(msg){
        this.sock.send(msg)
    }
}