// utils/DoublyLinkedList.ts
export class SongNode {
  file: File;
  url: string;
  id: string;
  next: SongNode | null = null;
  prev: SongNode | null = null;

  constructor(file: File) {
    this.file = file;
    this.url = URL.createObjectURL(file);
    this.id = Math.random().toString(36).substr(2, 9);
  }

  cleanup() {
    URL.revokeObjectURL(this.url);
  }
}

export class DoublyLinkedList {
  head: SongNode | null = null;
  tail: SongNode | null = null;
  size: number = 0;

  addSong(file: File): SongNode {
    const newNode = new SongNode(file);
    
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      if (this.tail) this.tail.next = newNode;
      this.tail = newNode;
    }
    
    this.size++;
    return newNode;
  }

  removeSong(node: SongNode): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    node.cleanup();
    this.size--;
  }

  moveToPosition(node: SongNode, targetIndex: number): void {
    // Remove node from current position
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    // Find target position
    let current = this.head;
    let currentIndex = 0;

    while (current && currentIndex < targetIndex) {
      current = current.next;
      currentIndex++;
    }

    if (!current) {
      // Insert at end
      node.prev = this.tail;
      node.next = null;
      if (this.tail) this.tail.next = node;
      this.tail = node;
      if (!this.head) this.head = node;
    } else {
      // Insert before current
      node.next = current;
      node.prev = current.prev;
      
      if (current.prev) {
        current.prev.next = node;
      } else {
        this.head = node;
      }
      current.prev = node;
    }
  }

  toArray(): SongNode[] {
    const result: SongNode[] = [];
    let current = this.head;
    while (current) {
      result.push(current);
      current = current.next;
    }
    return result;
  }

  clear(): void {
    let current = this.head;
    while (current) {
      const next = current.next;
      current.cleanup();
      current = next;
    }
    this.head = null;
    this.tail = null;
    this.size = 0;
  }
}