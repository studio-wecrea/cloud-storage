export function isUndefined(value) {
  return typeof value === "undefined";
}

export function isEmpty(value) {
  if (
    typeof value === "undefined" ||
    value === null ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return true;
  }

  if (typeof value === "object") {
    if (
      Object.keys(value).length === 0 &&
      Object.getPrototypeOf(value) === Object.prototype
    ) {
      return true;
    }
  }

  return false;
}

export function isObject(obj) {
  var type = typeof obj;
  return obj != null && (type === "object" || type === "function");
}

export function isString(str) {
  return typeof str === "string";
}

export function isJson(str) {
  if (this.isUndefined(str) || !this.isString(str)) {
    return false;
  }
  let obj = JSON.parse(str);
  if (obj && typeof obj === "object" && obj !== null) {
    return true;
  }
  return false;
}

export function findInObject(obj, needle, first = false) {
  let result = obj.filter((row) => {
    return row[needle.index] === needle.value;
  });

  if (first === true && result.length > 0) {
    return result[0];
  }

  return result;
}

export function contains(obj, value) {
  return obj.indexOf(value) > -1;
}

export function toSlug(str) {
  if (this.isUndefined(str) || !this.isString(str)) {
    throw new Error(
      "String parameter is expected, received " + typeof str + "."
    );
  }

  str = str.replace(/^\s+|\s+$/g, ""); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  let from = "àáäâèéëêìíïîòóöôùúüûñç·/,:;";
  let to = "aaaaeeeeiiiioooouuuunc------";
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9_ -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes

  return str;
}

export default {
  isUndefined,
  isEmpty,
  isString,
  isObject,
  isJson,
  findInObject,
  contains,
  toSlug,
};
