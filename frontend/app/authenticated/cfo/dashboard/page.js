"use client";
import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/app/_components/protectedRoute";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import customFetch from "@/lib/fetch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Search, Eye, Plus } from "lucide-react";

function CFODashboardPage() {
  const router = useRouter();
  const [allIncomes, setAllIncomes] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate financial summaries
  const calculateSummary = (incomes, expenses) => {
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpense = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    return {
      totalIncome,
      totalExpense,
      profitLoss: totalIncome - totalExpense,
    };
  };

  // Company-wide summary (ALL transactions)
  const companySummary = calculateSummary(allIncomes, allExpenses);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performClientSideSearch();
      } else {
        setFilteredIncomes([]);
        setFilteredExpenses([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      const [incomes, expenses, projectsData] = await Promise.all([
        customFetch("/income"),
        customFetch("/expense"),
        customFetch("/projects/projects"),
      ]);

      setAllIncomes(incomes);
      setAllExpenses(expenses);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      toast.error("Failed to load financial data", {
        description: error.message || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const performClientSideSearch = () => {
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase();

    const incomeResults = allIncomes.filter(
      (income) =>
        income.amount.toString().includes(query) ||
        income.description.toLowerCase().includes(query) ||
        new Date(income.date).toLocaleDateString().includes(query) ||
        income.projectId?.name?.toLowerCase().includes(query)
    );

    const expenseResults = allExpenses.filter(
      (expense) =>
        expense.amount.toString().includes(query) ||
        expense.description.toLowerCase().includes(query) ||
        new Date(expense.date).toLocaleDateString().includes(query) ||
        expense.projectId?.name?.toLowerCase().includes(query)
    );

    setFilteredIncomes(incomeResults);
    setFilteredExpenses(expenseResults);
  };

  const handleViewDetails = (type, id) => {
    router.push(`/authenticated/cfo/transaction/${type}/${id}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/authenticated/cfo/add/income">
              <Button className="flex items-center gap-2">
                <Plus size={16} /> Add Income
              </Button>
            </Link>
            <Link href="/authenticated/cfo/add/expense">
              <Button className="flex items-center gap-2">
                <Plus size={16} /> Add Expense
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search financial records by amount, description, date, or project..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : searchQuery ? (
          <>
            {/* Search Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Income Results ({filteredIncomes.length})
                </h2>
                {filteredIncomes.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Amount</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Project</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredIncomes.map((income) => (
                          <TableRow key={income._id}>
                            <TableCell>
                              {formatCurrency(income.amount)}
                            </TableCell>
                            <TableCell
                              className={
                                "max-w-[300px] whitespace-normal break-words"
                              }
                            >
                              {income.description}
                            </TableCell>
                            <TableCell>{formatDate(income.date)}</TableCell>
                            <TableCell>
                              {income.projectId?.name || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleViewDetails("income", income._id)
                                }
                              >
                                <Eye size={16} className="mr-1" /> View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No matching income records found
                  </p>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Expense Results ({filteredExpenses.length})
                </h2>
                {filteredExpenses.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Amount</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Project</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExpenses.map((expense) => (
                          <TableRow key={expense._id}>
                            <TableCell>
                              {formatCurrency(expense.amount)}
                            </TableCell>
                            <TableCell
                              className={
                                "max-w-[300px] whitespace-normal break-words"
                              }
                            >
                              {expense.description}
                            </TableCell>
                            <TableCell>{formatDate(expense.date)}</TableCell>
                            <TableCell>
                              {expense.projectId?.name || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleViewDetails("expense", expense._id)
                                }
                              >
                                <Eye size={16} className="mr-1" /> View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No matching expense records found
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Company Financial Summary (ALL transactions) */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Company Financial Summary (All Transactions)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800">Total Income</h3>
                  <p className="text-2xl font-bold">
                    {formatCurrency(companySummary.totalIncome)}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800">Total Expense</h3>
                  <p className="text-2xl font-bold">
                    {formatCurrency(companySummary.totalExpense)}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    companySummary.profitLoss >= 0
                      ? "bg-blue-50 text-blue-800"
                      : "bg-orange-50 text-orange-800"
                  }`}
                >
                  <h3 className="font-semibold">Profit/Loss</h3>
                  <p className="text-2xl font-bold">
                    {formatCurrency(companySummary.profitLoss)}
                  </p>
                </div>
              </div>
            </div>

            {/* All Incomes and Expenses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  All Incomes ({allIncomes.length})
                </h2>
                {allIncomes.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Amount</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Project</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allIncomes.map((income) => (
                          <TableRow key={income._id}>
                            <TableCell>
                              {formatCurrency(income.amount)}
                            </TableCell>
                            <TableCell
                              className={
                                "max-w-[300px] whitespace-normal break-words"
                              }
                            >
                              {income.description}
                            </TableCell>
                            <TableCell>{formatDate(income.date)}</TableCell>
                            <TableCell>
                              {income.projectId?.name || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleViewDetails("income", income._id)
                                }
                              >
                                <Eye size={16} className="mr-1" /> View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-gray-500">No income records found</p>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">
                  All Expenses ({allExpenses.length})
                </h2>
                {allExpenses.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Amount</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Project</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allExpenses.map((expense) => (
                          <TableRow key={expense._id}>
                            <TableCell>
                              {formatCurrency(expense.amount)}
                            </TableCell>
                            <TableCell
                              className={
                                "max-w-[300px] whitespace-normal break-words"
                              }
                            >
                              {expense.description}
                            </TableCell>
                            <TableCell>{formatDate(expense.date)}</TableCell>
                            <TableCell>
                              {expense.projectId?.name || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleViewDetails("expense", expense._id)
                                }
                              >
                                <Eye size={16} className="mr-1" /> View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-gray-500">No expense records found</p>
                )}
              </div>
            </div>

            {/* Project-wise Financial Data */}
            {projects.map((project) => {
              const projectIncomes = allIncomes.filter(
                (income) => income.projectId?._id === project._id
              );
              const projectExpenses = allExpenses.filter(
                (expense) => expense.projectId?._id === project._id
              );
              const projectSummary = calculateSummary(
                projectIncomes,
                projectExpenses
              );

              return (
                <div key={project._id} className="mb-12">
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">
                      Project: {project.name}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800">
                          Total Income
                        </h3>
                        <p className="text-xl font-bold">
                          {formatCurrency(projectSummary.totalIncome)}
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-red-800">
                          Total Expense
                        </h3>
                        <p className="text-xl font-bold">
                          {formatCurrency(projectSummary.totalExpense)}
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-lg ${
                          projectSummary.profitLoss >= 0
                            ? "bg-blue-50 text-blue-800"
                            : "bg-orange-50 text-orange-800"
                        }`}
                      >
                        <h3 className="font-semibold">Profit/Loss</h3>
                        <p className="text-xl font-bold">
                          {formatCurrency(projectSummary.profitLoss)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Project Incomes ({projectIncomes.length})
                      </h3>
                      {projectIncomes.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Amount</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {projectIncomes.map((income) => (
                                <TableRow key={income._id}>
                                  <TableCell>
                                    {formatCurrency(income.amount)}
                                  </TableCell>
                                  <TableCell
                                    className={
                                      "max-w-[300px] whitespace-normal break-words"
                                    }
                                  >
                                    {income.description}
                                  </TableCell>
                                  <TableCell>
                                    {formatDate(income.date)}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleViewDetails("income", income._id)
                                      }
                                    >
                                      <Eye size={16} className="mr-1" /> View
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No income records for this project
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Project Expenses ({projectExpenses.length})
                      </h3>
                      {projectExpenses.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Amount</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {projectExpenses.map((expense) => (
                                <TableRow key={expense._id}>
                                  <TableCell>
                                    {formatCurrency(expense.amount)}
                                  </TableCell>
                                  <TableCell
                                    className={
                                      "max-w-[300px] whitespace-normal break-words"
                                    }
                                  >
                                    {expense.description}
                                  </TableCell>
                                  <TableCell>
                                    {formatDate(expense.date)}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleViewDetails(
                                          "expense",
                                          expense._id
                                        )
                                      }
                                    >
                                      <Eye size={16} className="mr-1" /> View
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No expense records for this project
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default CFODashboardPage;
