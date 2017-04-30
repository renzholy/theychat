export async function sleep(milliseconds: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    setTimeout(resolve, milliseconds)
  })
}
