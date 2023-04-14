import { Message } from "../resources/context";

export class ConsoleUX{
    constructor(){

    }

    render(message: Message[] ){
        console.clear()
        let render = "\n\n#####################\n";

        render+="# Mensajes"
        render+="\n\n"
        message.forEach((m,i)=>{
            if((i+1)%2) render+="\n"
            if(i!=0) render+="\n"
            render+=`${m.role}: ${m.content}`
        })

        console.log(render)
    }
}