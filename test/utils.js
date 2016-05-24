import crypto from "crypto"

class Utils {

  /**
  * Build (semi) uuid. Warning regarding to security, result is not real 
  * uuid since we use basic random generator.
  *
  * @return uuid
  */
  static getUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = crypto.randomBytes(1)[0]%16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
    });
  }
}

export default Utils;