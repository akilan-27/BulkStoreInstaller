import { EventEmitter } from 'events';
import { WingetEvent } from './types';

class CompanionEventEmitter extends EventEmitter {
  emitEvent(event: WingetEvent) {
    this.emit(event.type, event);
    this.emit('*', event);
  }
}

export const companionEvents = new CompanionEventEmitter();
