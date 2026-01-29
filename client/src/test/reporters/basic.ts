import type { Reporter } from 'vitest';
import { DefaultReporter } from 'vitest/reporters';

/**
 * Basic reporter - simple wrapper around default reporter
 * This allows --reporter=basic to work
 */
export default class BasicReporter extends DefaultReporter {
  // Inherits all behavior from DefaultReporter
  // This is just an alias to make "basic" work
}
