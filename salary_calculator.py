"""연봉 계산기 GUI - 실수령액 계산 프로그램"""

import tkinter as tk
from tkinter import ttk


def calculate_salary(annual_salary, dependents=1, children_under_20=0):
    monthly_salary = annual_salary / 12

    national_pension = min(monthly_salary * 0.045, 298_890)
    health_insurance = monthly_salary * 0.03545
    long_term_care = health_insurance * 0.1295
    employment_insurance = monthly_salary * 0.009
    total_insurance = national_pension + health_insurance + long_term_care + employment_insurance

    income_tax = estimate_income_tax(monthly_salary, dependents, children_under_20)
    local_income_tax = income_tax * 0.1
    total_deduction = total_insurance + income_tax + local_income_tax
    net_monthly = monthly_salary - total_deduction

    return {
        "월급(세전)": monthly_salary,
        "국민연금": national_pension,
        "건강보험": health_insurance,
        "장기요양보험": long_term_care,
        "고용보험": employment_insurance,
        "4대보험 합계": total_insurance,
        "소득세": income_tax,
        "지방소득세": local_income_tax,
        "공제 합계": total_deduction,
        "월 실수령액": net_monthly,
        "연 실수령액": net_monthly * 12,
    }


def estimate_income_tax(monthly, dependents, children_under_20):
    taxable = max((monthly - 200_000) * 12, 0)

    if taxable <= 5_000_000:
        earned_deduction = taxable * 0.7
    elif taxable <= 15_000_000:
        earned_deduction = 3_500_000 + (taxable - 5_000_000) * 0.4
    elif taxable <= 45_000_000:
        earned_deduction = 7_500_000 + (taxable - 15_000_000) * 0.15
    elif taxable <= 100_000_000:
        earned_deduction = 12_000_000 + (taxable - 45_000_000) * 0.05
    else:
        earned_deduction = 14_750_000 + (taxable - 100_000_000) * 0.02

    personal_deduction = dependents * 1_500_000
    tax_base = max(taxable - earned_deduction - personal_deduction, 0)

    if tax_base <= 14_000_000:
        tax = tax_base * 0.06
    elif tax_base <= 50_000_000:
        tax = 840_000 + (tax_base - 14_000_000) * 0.15
    elif tax_base <= 88_000_000:
        tax = 6_240_000 + (tax_base - 50_000_000) * 0.24
    elif tax_base <= 150_000_000:
        tax = 15_360_000 + (tax_base - 88_000_000) * 0.35
    elif tax_base <= 300_000_000:
        tax = 37_060_000 + (tax_base - 150_000_000) * 0.38
    elif tax_base <= 500_000_000:
        tax = 94_060_000 + (tax_base - 300_000_000) * 0.40
    elif tax_base <= 1_000_000_000:
        tax = 174_060_000 + (tax_base - 500_000_000) * 0.42
    else:
        tax = 384_060_000 + (tax_base - 1_000_000_000) * 0.45

    if children_under_20 == 1:
        tax -= 150_000
    elif children_under_20 == 2:
        tax -= 350_000
    elif children_under_20 >= 3:
        tax -= 350_000 + (children_under_20 - 2) * 300_000

    return max(round(tax / 12, -1), 0)


class SalaryCalculatorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("연봉 계산기")
        self.root.resizable(False, False)

        # 스타일
        style = ttk.Style()
        style.configure("Title.TLabel", font=("Helvetica", 18, "bold"))
        style.configure("Result.TLabel", font=("Helvetica", 14, "bold"), foreground="#2563eb")
        style.configure("Header.TLabel", font=("Helvetica", 11, "bold"))
        style.configure("Item.TLabel", font=("Helvetica", 11))
        style.configure("Money.TLabel", font=("Helvetica", 11))
        style.configure("Calc.TButton", font=("Helvetica", 13, "bold"))

        main = ttk.Frame(root, padding=30)
        main.grid()

        # 제목
        ttk.Label(main, text="연봉 계산기", style="Title.TLabel").grid(
            row=0, column=0, columnspan=2, pady=(0, 20)
        )

        # 입력 영역
        input_frame = ttk.LabelFrame(main, text="입력", padding=15)
        input_frame.grid(row=1, column=0, columnspan=2, sticky="ew", pady=(0, 15))

        ttk.Label(input_frame, text="연봉 (만원):", font=("Helvetica", 12)).grid(
            row=0, column=0, sticky="w", pady=5
        )
        self.salary_var = tk.StringVar(value="5000")
        salary_entry = ttk.Entry(input_frame, textvariable=self.salary_var, width=15, font=("Helvetica", 12))
        salary_entry.grid(row=0, column=1, sticky="w", padx=(10, 0), pady=5)
        salary_entry.focus()

        ttk.Label(input_frame, text="부양가족 수 (본인 포함):", font=("Helvetica", 12)).grid(
            row=1, column=0, sticky="w", pady=5
        )
        self.dependents_var = tk.StringVar(value="1")
        ttk.Spinbox(input_frame, from_=1, to=20, textvariable=self.dependents_var, width=5, font=("Helvetica", 12)).grid(
            row=1, column=1, sticky="w", padx=(10, 0), pady=5
        )

        ttk.Label(input_frame, text="20세 이하 자녀 수:", font=("Helvetica", 12)).grid(
            row=2, column=0, sticky="w", pady=5
        )
        self.children_var = tk.StringVar(value="0")
        ttk.Spinbox(input_frame, from_=0, to=20, textvariable=self.children_var, width=5, font=("Helvetica", 12)).grid(
            row=2, column=1, sticky="w", padx=(10, 0), pady=5
        )

        # 계산 버튼
        calc_btn = ttk.Button(main, text="계산하기", style="Calc.TButton", command=self.calculate)
        calc_btn.grid(row=2, column=0, columnspan=2, pady=10, ipadx=20, ipady=5)

        # 결과 영역
        self.result_frame = ttk.LabelFrame(main, text="결과", padding=15)
        self.result_frame.grid(row=3, column=0, columnspan=2, sticky="ew", pady=(5, 0))

        # 결과 라벨들 미리 생성
        self.result_labels = {}
        items = [
            ("월급(세전)", False),
            ("sep1", True),
            ("국민연금", False),
            ("건강보험", False),
            ("장기요양보험", False),
            ("고용보험", False),
            ("소득세", False),
            ("지방소득세", False),
            ("sep2", True),
            ("공제 합계", False),
            ("sep3", True),
            ("월 실수령액", False),
            ("연 실수령액", False),
        ]

        for i, (key, is_sep) in enumerate(items):
            if is_sep:
                ttk.Separator(self.result_frame, orient="horizontal").grid(
                    row=i, column=0, columnspan=2, sticky="ew", pady=5
                )
            else:
                is_highlight = key in ("월 실수령액", "연 실수령액")
                label_style = "Result.TLabel" if is_highlight else "Item.TLabel"
                value_style = "Result.TLabel" if is_highlight else "Money.TLabel"

                ttk.Label(self.result_frame, text=key, style=label_style).grid(
                    row=i, column=0, sticky="w", pady=2
                )
                val_label = ttk.Label(self.result_frame, text="-", style=value_style, anchor="e", width=18)
                val_label.grid(row=i, column=1, sticky="e", pady=2, padx=(30, 0))
                self.result_labels[key] = val_label

        # Enter 키로 계산
        root.bind("<Return>", lambda e: self.calculate())

        # 초기 계산
        self.calculate()

    def calculate(self):
        try:
            salary = float(self.salary_var.get()) * 10_000
            dependents = int(self.dependents_var.get())
            children = int(self.children_var.get())
        except ValueError:
            for label in self.result_labels.values():
                label.config(text="입력 오류")
            return

        if salary <= 0:
            for label in self.result_labels.values():
                label.config(text="-")
            return

        result = calculate_salary(salary, dependents, children)

        for key, label in self.result_labels.items():
            label.config(text=f"{result[key]:,.0f}원")


if __name__ == "__main__":
    root = tk.Tk()
    app = SalaryCalculatorApp(root)
    root.mainloop()
