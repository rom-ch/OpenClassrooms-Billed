/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

import mockStore from "../__mocks__/store.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
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

    test("Then I can add a file with the correct format", () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(e => newBill.handleChangeFile(e));
      const input = screen.getByTestId("file");
      // const file = new File(["expense.jpeg"], "expense.jpeg", {
      //   type: "image/jpeg",
      // });

      window.alert = jest.fn();

      input.addEventListener("change", handleChangeFile);

      fireEvent.change(input, {
        target: {
          files: [
            new File(["expense image"], "expense.jpeg", { type: "image/jpeg" }),
          ],
        },
      });

      // userEvent.upload(input, file);
      jest.spyOn(window, "alert");
      expect(handleChangeFile).toHaveBeenCalled();
      console.log(input.files[0].name);
      expect(input.files[0].name).toStrictEqual("expense.jpeg");
      expect(input.files).toHaveLength(1);
      expect(input.formData).not.toBeNull();
    });
  });
});

// Post

describe("given I am connected as an employee", () => {
  describe("When I an on the Newbill page and submit the form", () => {
    test("Then it should create a new bill", async () => {
      const postSpy = jest.spyOn(mockStore, "bills");
      const bill = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl:
          "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20,
      };

      const postBills = await mockStore.bills().update(bill);
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postBills).toStrictEqual(bill);
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        // console.error = jest.fn();
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        document.body.innerHTML = NewBillUI();

        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES({ pathname });
        };
      });

      test("post bill with 404 message error", async () => {
        const postSpy = jest.spyOn(console, "error");

        const store = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
          update: jest.fn(() => Promise.reject(new Error("404"))),
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });

        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn(e => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);

        fireEvent.submit(form);
        await new Promise(process.nextTick);
        expect(postSpy).toBeCalledWith(new Error("404"));
      });

      test("Add bills from an API and fails with 500 message error", async () => {
        const postSpy = jest.spyOn(console, "error");

        const store = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
          update: jest.fn(() => Promise.reject(new Error("500"))),
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });

        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn(e => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);

        fireEvent.submit(form);
        await new Promise(process.nextTick);
        expect(postSpy).toBeCalledWith(new Error("500"));
      });
    });
  });
});
