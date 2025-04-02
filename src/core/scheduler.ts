/**
 * Task scheduler for optimizing rendering and reactivity
 * Implements efficient batching and prioritization
 */

type Task = {
  id: number;
  callback: () => void;
  priority: Priority;
};

// Task priority levels
export enum Priority {
  HIGH = 0, // Critical updates (user input)
  NORMAL = 1, // Regular UI updates
  LOW = 2, // Background/deferred work
}

// Unique task counter
let nextTaskId = 1;

// Task queues by priority
const taskQueue: Task[][] = [[], [], []];

// Scheduler state
let isScheduled = false;
let currentFrameDeadline = 0;
const frameLength = 16; // ~60fps

/**
 * Schedules a callback with a given priority
 */
export function scheduleTask(
  callback: () => void,
  priority: Priority = Priority.NORMAL
): number {
  const task: Task = {
    id: nextTaskId++,
    callback,
    priority,
  };

  // Add to appropriate queue
  taskQueue[priority].push(task);

  // Schedule processing if not already scheduled
  if (!isScheduled) {
    isScheduled = true;
    currentFrameDeadline = performance.now() + frameLength;
    queueMicrotask(processTaskQueue);
  }

  return task.id;
}

/**
 * Cancels a scheduled task by ID
 */
export function cancelTask(taskId: number): boolean {
  for (const queue of taskQueue) {
    const index = queue.findIndex(task => task.id === taskId);
    if (index >= 0) {
      queue.splice(index, 1);
      return true;
    }
  }
  return false;
}

/**
 * Process task queues according to priority
 */
function processTaskQueue() {
  const _startTime = performance.now();
  isScheduled = false;

  // Process high priority tasks first
  for (let priority = Priority.HIGH; priority <= Priority.LOW; priority++) {
    const queue = taskQueue[priority];

    // Process all tasks in this priority level
    while (queue.length > 0) {
      // Check time budget for lower priority tasks
      if (
        priority !== Priority.HIGH &&
        performance.now() >= currentFrameDeadline
      ) {
        // Out of time, schedule continuation
        isScheduled = true;
        requestAnimationFrame(() => {
          currentFrameDeadline = performance.now() + frameLength;
          queueMicrotask(processTaskQueue);
        });
        return;
      }

      // Execute task
      const task = queue.shift()!;
      try {
        task.callback();
      } catch (error) {
        console.error('Error in scheduled task:', error);
      }
    }
  }
}

/**
 * Schedule a callback to run after the browser has performed layout calculations
 */
export function afterLayout(callback: () => void): void {
  requestAnimationFrame(() => {
    callback();
  });
}

/**
 * Schedule a callback to run after paint
 */
export function afterPaint(callback: () => void): void {
  requestAnimationFrame(() => {
    setTimeout(callback, 0);
  });
}

/**
 * Defers a task to run when the main thread is idle
 */
export function scheduleIdle(callback: () => void): void {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => {
      callback();
    });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(callback, 1);
  }
}
