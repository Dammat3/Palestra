/**
 * In-memory channel for passing a selected exercise back from the picker
 * to the active workout screen, without modifying expo-router params.
 *
 * Usage in active workout before navigating:
 *   setPickerCallback((exercise) => { ...add exercise to logs... });
 *   router.push("/picker/exercises");
 *
 * Usage in picker's onSelect handler:
 *   resolvePickerSelection({ id, name, muscleGroup, image, images });
 *   router.back();
 */

type PickerCallback = (exercise: {
  id: string;
  name: string;
  muscleGroup: string;
  image: string | null;
  images?: string[];
}) => void;

let _callback: PickerCallback | null = null;

export function setPickerCallback(fn: PickerCallback): void {
  _callback = fn;
}

export function resolvePickerSelection(exercise: Parameters<PickerCallback>[0]): void {
  if (_callback) {
    _callback(exercise);
    _callback = null;
  }
}

export function hasPendingPickerCallback(): boolean {
  return _callback !== null;
}

export function clearPickerCallback(): void {
  _callback = null;
}
