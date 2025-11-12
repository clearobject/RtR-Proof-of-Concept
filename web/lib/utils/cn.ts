type ClassDictionary = Record<string, boolean | null | undefined>
type ClassValue = string | false | null | undefined | ClassValue[] | ClassDictionary

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = []

  const process = (value: ClassValue): void => {
    if (!value) {
      return
    }

    if (typeof value === 'string') {
      classes.push(value)
      return
    }

    if (Array.isArray(value)) {
      value.forEach(process)
      return
    }

    for (const [className, condition] of Object.entries(value)) {
      if (condition) {
        classes.push(className)
      }
    }
  }

  inputs.forEach(process)

  return classes.join(' ')
}

