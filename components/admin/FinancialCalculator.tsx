"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, TrendingUp, DollarSign, Calendar } from "lucide-react";

/*********************************
 * Types & Utilities
 *********************************/

export interface CalculatorProps {
  type: "compound_interest" | "mortgage" | "investment_return" | "budget";
  title?: string;
  description?: string;
}

interface CompoundInterestRow {
  year: number;
  amount: number;
  interest: number;
}

interface CompoundInterestResult {
  principal: number;
  interest: number;
  total: number;
  breakdown: CompoundInterestRow[];
}

interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  downPayment: number;
  loanAmount: number;
}

interface InvestmentReturnResult {
  totalReturn: number;
  percentageReturn: number; // %
  annualizedReturn: number; // %
  initial: number;
  final: number;
  time: number; // years
}

interface BudgetExpense {
  category: string;
  amount: string; // keep as string for controlled Input
}

interface BudgetResult {
  income: number;
  totalExpenses: number;
  remaining: number;
  savingsRate: number; // % of income
  expenses: { category: string; amount: string }[];
}

const fmtCurrency = (value: number): string =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(isFinite(value) ? value : 0);

const toNum = (v: string): number => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

/*********************************
 * Root Export
 *********************************/

export default function FinancialCalculator({
  type,
  title,
  description,
}: CalculatorProps) {
  switch (type) {
    case "compound_interest":
      return (
        <CompoundInterestCalculator title={title} description={description} />
      );
    case "mortgage":
      return <MortgageCalculator title={title} description={description} />;
    case "investment_return":
      return (
        <InvestmentReturnCalculator title={title} description={description} />
      );
    case "budget":
      return <BudgetCalculator title={title} description={description} />;
    default:
      return <div>Unknown calculator type</div>;
  }
}

/*********************************
 * Compound Interest
 *********************************/

function CompoundInterestCalculator({
  title = "Compound Interest Calculator",
  description,
}: {
  title?: string;
  description?: string;
}) {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState(""); // annual %
  const [time, setTime] = useState(""); // years
  const [frequency, setFrequency] = useState("1"); // per year

  const result: CompoundInterestResult | null = useMemo(() => {
    const p = toNum(principal);
    const r = toNum(rate) / 100;
    const t = toNum(time);
    const n = Math.max(1, Math.floor(toNum(frequency)));

    if (p <= 0 || r <= 0 || t <= 0 || !Number.isFinite(n)) return null;

    const total = p * Math.pow(1 + r / n, n * t);
    const interest = total - p;

    const years = Math.min(50, Math.ceil(t));
    const breakdown: CompoundInterestRow[] = Array.from(
      { length: years },
      (_, i) => {
        const y = i + 1;
        const amt = p * Math.pow(1 + r / n, n * y);
        return { year: y, amount: amt, interest: amt - p };
      }
    );

    return { principal: p, interest, total, breakdown };
  }, [principal, rate, time, frequency]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="principal">Principal Amount ($)</Label>
            <Input
              id="principal"
              type="number"
              inputMode="decimal"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="1000"
            />
          </div>
          <div>
            <Label htmlFor="rate">Annual Interest Rate (%)</Label>
            <Input
              id="rate"
              type="number"
              inputMode="decimal"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="5"
            />
          </div>
          <div>
            <Label htmlFor="time">Time (Years)</Label>
            <Input
              id="time"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="10"
            />
          </div>
          <div>
            <Label htmlFor="frequency">Compounding Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Annually</SelectItem>
                <SelectItem value="2">Semi-annually</SelectItem>
                <SelectItem value="4">Quarterly</SelectItem>
                <SelectItem value="12">Monthly</SelectItem>
                <SelectItem value="365">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Principal</div>
                  <div className="text-2xl font-bold">
                    {fmtCurrency(result.principal)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">
                    Interest Earned
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {fmtCurrency(result.interest)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">
                    Total Amount
                  </div>
                  <div className="text-2xl font-bold">
                    {fmtCurrency(result.total)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Year-by-Year Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.breakdown.map((row) => (
                    <div
                      key={row.year}
                      className="flex justify-between items-center p-2 bg-muted rounded"
                    >
                      <span>Year {row.year}</span>
                      <div className="text-right">
                        <div className="font-medium">
                          {fmtCurrency(row.amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          +{fmtCurrency(row.interest)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/*********************************
 * Mortgage
 *********************************/

function MortgageCalculator({
  title = "Mortgage Payment Calculator",
  description,
}: {
  title?: string;
  description?: string;
}) {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("30");
  const [downPayment, setDownPayment] = useState("");

  const result: MortgageResult | null = useMemo(() => {
    const loan = toNum(loanAmount);
    const down = toNum(downPayment);
    const principal = Math.max(loan - down, 0);
    const rate = toNum(interestRate) / 100 / 12; // monthly rate
    const term = Math.max(1, Math.floor(toNum(loanTerm) * 12)); // months

    if (principal <= 0 || rate <= 0 || term <= 0) return null;

    const pow = Math.pow(1 + rate, term);
    const monthlyPayment = (principal * rate * pow) / (pow - 1);
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - principal;

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      principal,
      downPayment: down,
      loanAmount: loan,
    };
  }, [loanAmount, interestRate, loanTerm, downPayment]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="loan-amount">Loan Amount ($)</Label>
            <Input
              id="loan-amount"
              type="number"
              inputMode="decimal"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="300000"
            />
          </div>
          <div>
            <Label htmlFor="down-payment">Down Payment ($)</Label>
            <Input
              id="down-payment"
              type="number"
              inputMode="decimal"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              placeholder="60000"
            />
          </div>
          <div>
            <Label htmlFor="interest-rate">Annual Interest Rate (%)</Label>
            <Input
              id="interest-rate"
              type="number"
              inputMode="decimal"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="4.5"
            />
          </div>
          <div>
            <Label htmlFor="loan-term">Loan Term (Years)</Label>
            <Select value={loanTerm} onValueChange={setLoanTerm}>
              <SelectTrigger id="loan-term">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 years</SelectItem>
                <SelectItem value="20">20 years</SelectItem>
                <SelectItem value="30">30 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  Monthly Payment
                </div>
                <div className="text-2xl font-bold">
                  {fmtCurrency(result.monthlyPayment)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  Total Interest
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {fmtCurrency(result.totalInterest)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  Total Payment
                </div>
                <div className="text-2xl font-bold">
                  {fmtCurrency(result.totalPayment)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  Down Payment
                </div>
                <div className="text-2xl font-bold">
                  {fmtCurrency(result.downPayment)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/*********************************
 * Investment Return
 *********************************/

function InvestmentReturnCalculator({
  title = "Investment Return Calculator",
  description,
}: {
  title?: string;
  description?: string;
}) {
  const [initialInvestment, setInitialInvestment] = useState("");
  const [finalValue, setFinalValue] = useState("");
  const [timePeriod, setTimePeriod] = useState(""); // in years

  const result: InvestmentReturnResult | null = useMemo(() => {
    const initial = toNum(initialInvestment);
    const final = toNum(finalValue);
    const time = toNum(timePeriod);

    if (initial <= 0 || final <= 0 || time <= 0) return null;

    const totalReturn = final - initial;
    const percentageReturn = (totalReturn / initial) * 100;
    const annualizedReturn = (Math.pow(final / initial, 1 / time) - 1) * 100;

    return {
      totalReturn,
      percentageReturn,
      annualizedReturn,
      initial,
      final,
      time,
    };
  }, [initialInvestment, finalValue, timePeriod]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="initial-investment">Initial Investment ($)</Label>
            <Input
              id="initial-investment"
              type="number"
              inputMode="decimal"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(e.target.value)}
              placeholder="10000"
            />
          </div>
          <div>
            <Label htmlFor="final-value">Final Value ($)</Label>
            <Input
              id="final-value"
              type="number"
              inputMode="decimal"
              value={finalValue}
              onChange={(e) => setFinalValue(e.target.value)}
              placeholder="15000"
            />
          </div>
          <div>
            <Label htmlFor="time-period">Time Period (Years)</Label>
            <Input
              id="time-period"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              placeholder="5"
            />
          </div>
        </div>

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  Total Return
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {fmtCurrency(result.totalReturn)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  Percentage Return
                </div>
                <div className="text-2xl font-bold">
                  {result.percentageReturn.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  Annualized Return
                </div>
                <div className="text-2xl font-bold">
                  {result.annualizedReturn.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/*********************************
 * Budget
 *********************************/

function BudgetCalculator({
  title = "Budget Calculator",
  description,
}: {
  title?: string;
  description?: string;
}) {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState<BudgetExpense[]>([
    { category: "Housing", amount: "" },
    { category: "Transportation", amount: "" },
    { category: "Food", amount: "" },
    { category: "Utilities", amount: "" },
    { category: "Entertainment", amount: "" },
    { category: "Healthcare", amount: "" },
    { category: "Savings", amount: "" },
    { category: "Other", amount: "" },
  ]);

  const result: BudgetResult | null = useMemo(() => {
    const monthlyIncome = toNum(income);
    if (monthlyIncome <= 0) return null;

    const totalExpenses = expenses.reduce((sum, e) => sum + toNum(e.amount), 0);
    const remaining = monthlyIncome - totalExpenses;
    const savingsRate =
      monthlyIncome > 0 ? (remaining / monthlyIncome) * 100 : 0;

    const used = expenses.filter((e) => toNum(e.amount) > 0);

    return {
      income: monthlyIncome,
      totalExpenses,
      remaining,
      savingsRate,
      expenses: used,
    };
  }, [income, expenses]);

  const updateExpense = (index: number, amount: string) => {
    setExpenses((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], amount };
      return copy;
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="income">Monthly Income ($)</Label>
          <Input
            id="income"
            type="number"
            inputMode="decimal"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="5000"
          />
        </div>

        <div className="space-y-2">
          <Label>Monthly Expenses</Label>
          {expenses.map((expense, index) => (
            <div key={expense.category} className="flex gap-2">
              <Input
                value={expense.amount}
                onChange={(e) => updateExpense(index, e.target.value)}
                placeholder="0"
                type="number"
                inputMode="decimal"
                className="flex-1"
                aria-label={`${expense.category} amount`}
              />
              <div className="w-32 text-sm text-muted-foreground flex items-center">
                {expense.category}
              </div>
            </div>
          ))}
        </div>

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">
                    Total Income
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {fmtCurrency(result.income)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">
                    Total Expenses
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {fmtCurrency(result.totalExpenses)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className="text-2xl font-bold">
                    {fmtCurrency(result.remaining)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.expenses.map((expense) => (
                    <div
                      key={expense.category}
                      className="flex justify-between items-center p-2 bg-muted rounded"
                    >
                      <span>{expense.category}</span>
                      <span className="font-medium">
                        {fmtCurrency(toNum(expense.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
