/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import Bills from "../containers/Bills.js";

import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

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
});

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      const isHighlighted = windowIcon.classList.contains("active-icon");
      //to-do write expect expression
      expect(isHighlighted).toBeTruthy();
    });

    test("Then bills should be ordered from earliest to latest", () => {
      bills.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        return dateB - dateA;
      });
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map(a => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("The title should be 'Mes notes de frais'", () => {
      const title = screen.getByTestId("title");
      expect(title.textContent).toBe("Mes notes de frais");
    });
  });

  describe("When I'm on the bill page and I click on the new bill button", () => {
    test("Then I should be redirected to the new bill form", () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      const bill = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const handleClickNewBill = jest.fn(() => bill.handleClickNewBill());
      screen
        .getByTestId("btn-new-bill")
        .addEventListener("click", handleClickNewBill);
      userEvent.click(screen.getByTestId("btn-new-bill"));
      expect(handleClickNewBill).toHaveBeenCalled();
    });
  });

  describe("When I'm on the bill page, there are bills and I click on the visualize icon", () => {
    test("Then a modal should open", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      window.onNavigate(ROUTES_PATH.Bills);

      const bill = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      // test un seul icon
      const eyeIcons = screen.getAllByTestId("icon-eye");
      const handleClickIconEye = jest.fn(bill.handleClickIconEye);

      const modale = document.getElementById("modaleFile");
      $.fn.modal = jest.fn(() => modale.classList.add("show"));

      eyeIcons.forEach(icon => {
        icon.addEventListener("click", () => handleClickIconEye(icon));
        userEvent.click(icon);
        expect(handleClickIconEye).toHaveBeenCalled();
      });
    });
  });
});

// Test intégration GET

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("title"));
      const newBillBtn = screen.getByTestId("btn-new-bill");
      const tableRows = screen.getByTestId("tbody");

      expect(newBillBtn).toBeTruthy();
      expect(tableRows).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
