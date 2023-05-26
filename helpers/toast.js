import { TOAST_MESSAGE } from "../utils/constants";
import { errorIcon, successIcon } from "../utils/icons";

export function toast(show, type, id) {
  if (show) {
    $(id).html(
      `${type === "error" ? errorIcon : successIcon}
        <p class='${type}'>${ type === "error"
            ? TOAST_MESSAGE.VARIANT.ERROR
            : TOAST_MESSAGE.VARIANT.SUCCESS
        }</p>`
    );
    $(id).show();
    if (type === "success") {
      setTimeout(() => {
        $(id).hide();
      }, 2000);
    }
  } else {
    $(id).hide();
  }
}
