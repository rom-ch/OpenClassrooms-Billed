/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

// import expenseImage from "../assets/images/facturefreemobile.jpg";

import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
    })
  );

  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
  document.body.innerHTML = NewBillUI();
  window.onNavigate(ROUTES_PATH.NewBill);
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the mail icon in the vertical layout should be highlighted", () => {
      const mailIcon = screen.getByTestId("icon-mail");
      const isHighlighted = mailIcon.classList.contains("active-icon");
      expect(isHighlighted).toBeTruthy();
    });

    // test("All required inputs", () => {
    //   const expenseDate = screen.getByTestId("datepicker");
    //   const expenseAmount = screen.getByTestId("amount");
    //   const expensePCT = screen.getByTestId("pct");
    //   const expenseImg = screen.getByTestId("file");

    //   userEvent.type(expenseNameInput, "Hello");
    //   expect(expenseNameInput.value).toBeTruthy();
    // });

    // test("Then I can upload a image", () => {
    //   const file = new File(["Expense Image"], "expense.jpeg", {
    //     type: "image/jpeg",
    //   });
    //   const input = screen.getByTestId("file");
    //   userEvent.upload(input, file);

    //   expect(input.files[0]).toStrictEqual(file);
    //   expect(input.files.item(0)).toStrictEqual(file);
    //   expect(input.files).toHaveLength(1);
    // });
  });
});
