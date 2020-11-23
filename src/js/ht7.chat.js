$(function() {
    const id = Math.floor((Math.random() * 100) + 1);

    const userSelf = new User(id, 'thomas-' + id, new Avatar('fas fa-dove', '#f99'));

    const cnt = new MainController(userSelf);

//    const userSecond = new User(123, 'heini', new Avatar('fas fa-dragon', '#99f'));
//
//    cnt.chats['ht7-chat-test-01'].addUser(userSecond);

    console.log(cnt);
});

String.prototype.htmlEntities = function() {
    var p = document.createElement('p');
    p.textContent = this;
    return p.innerHTML;
};

class MainController
{

    constructor(userSelf)
    {
        this.chats = {};

        this.init(userSelf);
    }

    init(userSelf)
    {
        document
                .querySelectorAll('.ht7-chat-base')
                .forEach(el => {
                    const container = el.closest('.ht7-chat-container');
                    const id = container.getAttribute('id');
                    const url = container.getAttribute('data-url');

//                    const $el = $(el);
//                    const id = $el.closest('.ht7-chat-container').prop('id');
                    const chat = new ChatController(id, url);

                    chat.addUser(userSelf);

                    // Save it for later use.
                    this.chats[id] = chat;
                });
    }

}

class ChatController
{

    constructor(id, url)
    {
        this.id = id;
        this.users = {};
        this.connector = new ChatConnector(url, this);

        this.win = new Window(id);
        this.input = new Input(id);
        this.output = new Output(id);
        this.members = new Members(id);

        this.init();
    }

    addUser(user)
    {
        this.users[user.id] = user;

        const message = new UserMoveMessage('enter', this.id, user);

        this.update(message);
    }

    getUsers()
    {
        return this.users;
    }

    getUserSelf()
    {
        return this.users[Object.keys(this.users)[0]];
    }

    init()
    {
        this.members.update(this.getUsers());
        this.initEventListeners();
    }

    initEventListeners()
    {
        const input = document.querySelector('#' + this.id + ' footer form');

        input.addEventListener(
                'submit',
                (e) => {
            e.preventDefault();
            this.messageSubmitted(e, this);
        });
        input.addEventListener(
                'keydown',
                (e) => {
            if (e.keyCode === 13) {
                e.preventDefault();

                if (e.shiftKey) {
                    e.target.value = e.target.value + "\n";
                } else {
                    e.target
                            .closest('form')
                            .querySelector('button[type=submit]')
                            .click();
                }
            }
        });
    }

    messageRecieved(message, self)
    {
        this.update(message);
    }

    messageSubmitted(e, self)
    {
        e.preventDefault();

        const $chat = $(e.target).closest('.ht7-chat-base');
        const id = $chat.parent().prop('id');

        const text = self.input.getText();

        if (text.length === 0) {
            /* Do nothing if we have no text. */
            return;
        }

        const message = new UserTextMessage('request', this.id, this.getUserSelf(), text);

        console.log('message: ', message);

        this.connector.sendMessage(message);

        this.update(message);
    }

    update(message)
    {
        if (message.releaser === 'user') {
            if (message instanceof UserTextMessage) {
                this.input.update(message);
                this.output.update(message);
            } else if (message instanceof UserMoveMessage) {
                this.members.update(message);
            }
        }
    }

}

class ChatConnector
{

    constructor(route, parent)
    {
        this.connection = new WebSocket(route);
        this.parent = parent;

        this.connection.onclose = this.getOnClose;
        this.connection.onerror = this.getOnError;
        this.connection.onmessage = (e) => parent.update(this.createMessage(JSON.parse(e.data)));
//        this.connection.onmessage = this.getOnMessage;
        this.connection.onopen = this.getOnOpen;
    }

    createMessage(response)
    {
        if (response.releaser === 'user') {
            let user = this.parent.getUsers()[response.user];

            if (response.action === 'request' || response.action === 'response') {
                if (response.action === 'request') {
                    user = response.user;
                }
                // A request action has to be transformed into a response for
                // the other clients.
                return new UserTextMessage(
                        'response',
                        response.chatId,
                        user,
                        response.text,
                        response.datetime,
                        );
            } else {
                return new UserMoveMessage(
                        response.action,
                        response.chatId,
                        user,
                        response.datetime,
                        );
            }
        }
    }

    getOnClose(e)
    {
        console.log('Verbindung abgebrochen');
    }

    getOnError(e)
    {
        console.log('error ', e);
    }

    getOnMessage(e)
    {
        console.log(JSON.parse(e.data));

        const message = this.createMessage(JSON.parse(e.data));

//        return;
    }

    getOnOpen(e)
    {
        console.log('Connection established');
    }

    sendMessage(message)
    {
        this.connection.send(JSON.stringify(message));
//        this.connection.send(message.text);
    }

//    constructor(route, ...eventHandlers)
//    {
//        this.connection = new WebSocket(route);
//
//        eventHandlers.forEach(handler => {
//            Object.keys(handler).forEach(key => {
//                this.connection[key] = handler[key];
//            });
//        });
//    }

}

class DisplayElement
{

    constructor(id, selectorSuffix = '')
    {
        this.id = id;
        this.selectorContentContainer = this.getSelectorMain()
                + (selectorSuffix.length === 0 ? '' : ' ' + selectorSuffix);
    }

    getContentContainer()
    {
        return document.querySelectorAll(this.selectorContentContainer)[0];
    }

    getSelectorMain()
    {
        return '#' + this.id;
    }

}

class Window extends DisplayElement
{

    constructor(id)
    {
        super(id);
    }

    update()
    {
        //
    }

}

class Input extends DisplayElement
{

    constructor(id)
    {
        super(id, 'footer form .form-control');
    }

    getText()
    {
        return this.getContentContainer().value;
    }

    update(message)
    {
        if (message instanceof UserTextMessage) {
            if (message.action === 'request') {
                this.getContentContainer().value = '';
            }
        }
    }

}

class Output extends DisplayElement
{

    constructor(id)
    {
        super(id, 'main .container-output .well');
    }

    createItem(message)
    {
        /* @see https://developer.mozilla.org/de/docs/Web/HTML/Element/template */
        const selectorTemplate = this.getSelectorMain() + ' template.output-item';

        const template = document.querySelector(selectorTemplate);
        const item = document.importNode(template.content, true);

        console.log(message.getText());

        item.querySelector('.content').innerHTML = message.getText('html');
        item.querySelector('.avatar i').className = message.user.avatar.cls;
        item.querySelector('.avatar i').style = 'color: ' + message.user.avatar.color;
        item.querySelector('.avatar i').setAttribute('title', message.getDatetime(true));

        return item;
    }

    update(message)
    {
        const item = this.createItem(message);

        this.getContentContainer()
                .append(item);
    }

}

class Members extends DisplayElement
{

    constructor(id)
    {
        super(id, 'main .container-members .well');
    }

    createItem(message)
    {
        // from https://developer.mozilla.org/de/docs/Web/HTML/Element/template
        const selectorTemplate = this.getSelectorMain() + ' template.member-item';
        const user = message.getUser();

        const template = document.querySelector(selectorTemplate);
        const item = document.importNode(template.content, true);
        const itemAvatar = item.querySelector('.avatar i');

        item.className += ' user-' + user.id;
        item.querySelector('.name').textContent = user.name;
        itemAvatar.className = user.avatar.cls;
        itemAvatar.style = 'color: ' + user.avatar.color;
        itemAvatar.setAttribute('title', message.getDatetime(true));

        return item;
    }

    removeItem(message)
    {
        this.getContentContainer()
                .querySelector('.user-' + message.getUser().id)
                .remove();
    }

    update(message)
    {
        if (message instanceof UserMoveMessage) {
            if (message.action === 'enter') {
                const item = this.createItem(message);

                this.getContentContainer()
                        .append(item);
            } else if (message.action === 'leave') {
                this.removeItem(message);
            }
        }

    }

}

class User
{

    constructor(id, name, avatar = new Avatar())
    {
        this.avatar = avatar;
        this.id = id;
        this.name = name;
    }

}

class Avatar
{

    constructor(cls = 'fas fa-cat', color = '#000')
    {
        this.cls = cls;
        this.color = color;
    }

}

class Message
{

    /**
     *
     * @param {string}  action      E.g. 'initialisation' or the user text.
     * @param {string}  releaser    'chat', 'server' or 'user'.
     * @param {string}  chatId      The chat id.
     * @param {Date}    datetime    The creation time of the message.
     * @returns {Message}
     */
    constructor(action, releaser, chatId, datetime = new Date())
    {
        this.action = action;
        this.chatId = chatId;
        this.datetime = datetime;
        this.releaser = releaser;
    }

    getAction()
    {
        return this.action;
    }

    getChatId()
    {
        return this.chatId;
    }

    getDatetime(asString = false)
    {
        return asString ? this.datetime : this.datetime.toLocaleString();
    }

    getReleaser()
    {
        return this.releaser;
    }

    getSendable()
    {
        return JSON.stringify(this);
    }

}

class ChatMessage extends Message
{

    constructor(action, chatId, datetime = new Date())
    {
        super(action, 'chat', chatId, datetime);
    }

}

class ServerMessage extends Message
{

    /**
     *
     * @param {string}  action      Valid values: 'init', 'connected', 'closed'.
     * @param {string}  chatId      The chat id, taken from the chat container attribute.
     * @param {Date}    datetime    The release datetime of the message.
     * @returns {ServerMessage}
     */
    constructor(action, chatId, datetime = new Date())
    {
        super(action, 'server', chatId, datetime);
    }

}

//class ServerInitialisationMessage extends ServerMessage
//{
//    constructor(chatId, datetime = new Date())
//    {
//        super('initialisation', chatId, datetime);
//    }
//}

class UserMessage extends Message
{

    constructor(action, chatId, user, datetime = new Date())
    {
        super(action, 'user', chatId, datetime);

        this.user = user;
    }

    getSendable()
    {
        const user = Object.assign({}, this.user);
        this.user = user.id;

        const returnUser = super.getSendable();

        this.user = user;

        return returnUser;
    }

    getUser()
    {
        return this.user;
    }

}

class UserMoveMessage extends UserMessage
{

    /**
     * @param {string}  action      Valid values: 'enter', 'leave', 'connecting' or 'connected'.
     * @param {string}  chatId      The chat id, taken from the chat container attribute.
     * @param {User}    user        The user text to send or recieve.
     * @param {Date}    datetime    The release datetime of the message.
     * @returns {UserMoveMessage}
     */
    constructor(action, chatId, user, datetime = new Date())
    {
        super(action, chatId, user, datetime);
    }

}

class UserTextMessage extends UserMessage
{

    /**
     * @param {string}  action      Valid values: 'request' or 'response'.
     * @param {string}  chatId      The chat id, taken from the chat container attribute.
     * @param {User}    user        The user instance of the current action.
     * @param {string}  text        The user text to send or recieve.
     * @param {Date}    datetime    The release datetime of the message.
     * @returns {UserTextMessage}
     */
    constructor(action, chatId, user, text, datetime = new Date())
    {
        super(action, chatId, user, datetime);

        this.text = text;
    }

    getText(outputType = 'default')
    {
        return outputType === 'html'
                ? this.text.htmlEntities().replace("\n", '<br />')
                : this.text;
    }

}
