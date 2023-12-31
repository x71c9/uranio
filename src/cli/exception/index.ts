/**
 *
 * Exception index module
 *
 * @packageDocumentation
 *
 */

export class UranioCLIException extends Error {
  public family = 'UranioCLIException';
  constructor(public message: string){
    super(message);
  }
}
