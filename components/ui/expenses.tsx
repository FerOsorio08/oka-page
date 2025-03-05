"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";

import { supabase } from "@/hooks/supabase";


type Expense = {
  id: string;
  b2b_cliente_id: string;
  tipo: string;
  concepto: string;
  proveedor: string;
  monto: string;
  metodo_pago: string;
  fecha: string;
  notas: string;
  created_at: string;
};

type ClienteB2B = {
  id: string;
  empresa: string;
};

type ExpenseType = {
  id: string;
  name: string;
};

type Proveedor = {
  id: string;
  name: string;
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clientesB2B, setClientesB2B] = useState<ClienteB2B[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [newExpense, setNewExpense] = useState({
    b2b_cliente_id: "",
    tipo: "",
    concepto: "",
    proveedor: "",
    monto: "",
    metodo_pago: "",
    fecha: "",
    notas: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchClientesB2B();
    fetchExpenseTypes();
    fetchProveedores();
  }, []);

  async function fetchExpenses() {
    const { data, error } = await supabase.from("egresos").select("*");
    if (error) {
      console.error("Error fetching expenses:", error);
    } else {
      setExpenses(data || []);
    }
  }

  async function fetchClientesB2B() {
    const { data, error } = await supabase.from("clientes_b2b").select("id, empresa");
    console.log("Data2", data);
    if (error) {
      console.error("Error fetching B2B clients:", error);
    } else {
      setClientesB2B(data || []);
    }
  }

  async function fetchExpenseTypes() {
    const { data, error } = await supabase.from("types_expense").select("id, name");
    console.log("Data", data);
    if (error) {
      console.error("Error fetching expense types:", error);
    } else {
      setExpenseTypes(data || []);
    }
  }

  async function fetchProveedores() {
    const { data, error } = await supabase.from("proveedores").select("id, name");
    console.log("Data3", data);
    if (error) {
      console.error("Error fetching providers:", error);
    } else {
      setProveedores(data || []);
    }
  }

  function getInputClassName(field: string) {
    return field ? "w-full border rounded-md p-2 mb-2" : "w-full border rounded-md p-2 mb-2 border-red-500";
  }

  async function addExpense() {
    if (!newExpense.b2b_cliente_id || !newExpense.tipo || !newExpense.concepto || !newExpense.proveedor || !newExpense.monto || !newExpense.metodo_pago || !newExpense.fecha) {
      alert("Por favor llenar todos los campos.");
      return;
    }

    setIsLoading(true);
    console.log("New Expense", newExpense);

    const { data, error } = await supabase.from("egresos").insert([newExpense]);

    setIsLoading(false);

    if (error) {
      console.error("Error adding expense:", error);
    } else {
      setNewExpense({
        b2b_cliente_id: "",
        tipo: "",
        concepto: "",
        proveedor: "",
        monto: "",
        metodo_pago: "",
        fecha: "",
        notas: "",
      });
      setIsDialogOpen(false);
      fetchExpenses();
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gastos</h1>
        <Button onClick={() => setIsDialogOpen(true)}>Registrar Gasto</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {expenses.map((expense) => (
          <Card key={expense.id} className="border rounded-md shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>{expense.concepto}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Cliente: {clientesB2B.find(cliente => cliente.id === expense.b2b_cliente_id)?.empresa || "N/A"}</p>
              <p>Tipo: {expenseTypes.find(type => type.id === expense.tipo)?.name || "N/A"}</p>
              <p>Proveedor: {proveedores.find(proveedor => proveedor.id === expense.proveedor)?.name || "N/A"}</p>
              <p>Monto: ${expense.monto}</p>
              <p>Método de Pago: {expense.metodo_pago}</p>
              <p>Fecha: {new Date(expense.fecha).toLocaleDateString()}</p>
              <p>Notas: {expense.notas}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <label className="block text-sm font-medium">Cliente B2B</label>
            <select
              value={newExpense.b2b_cliente_id}
              onChange={(e) => setNewExpense({ ...newExpense, b2b_cliente_id: e.target.value })}
              className={getInputClassName(newExpense.b2b_cliente_id)}
            >
              <option value="">Seleccionar cliente</option>
              {clientesB2B.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>{cliente.empresa}</option>
              ))}
            </select>
            <label className="block text-sm font-medium">Tipo</label>
            <select
              value={newExpense.tipo}
              onChange={(e) => setNewExpense({ ...newExpense, tipo: e.target.value })}
              className={getInputClassName(newExpense.tipo)}
            >
              <option value="">Seleccionar tipo</option>
              {expenseTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <label className="block text-sm font-medium">Concepto</label>
            <Input
              type="text"
              placeholder="Concepto"
              value={newExpense.concepto}
              onChange={(e) => setNewExpense({ ...newExpense, concepto: e.target.value })}
              className={getInputClassName(newExpense.concepto)}
            />
            <label className="block text-sm font-medium">Proveedor</label>
            <select
              value={newExpense.proveedor}
              onChange={(e) => setNewExpense({ ...newExpense, proveedor: e.target.value })}
              className={getInputClassName(newExpense.proveedor)}
            >
              <option value="">Seleccionar proveedor</option>
              {proveedores.map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id}>{proveedor.name}</option>
              ))}
            </select>
            <label className="block text-sm font-medium">Monto</label>
            <Input
              type="number"
              placeholder="Monto"
              value={newExpense.monto}
              onChange={(e) => setNewExpense({ ...newExpense, monto: e.target.value })}
              className={getInputClassName(newExpense.monto)}
            />
            <label className="block text-sm font-medium">Método de Pago</label>
            <select
              value={newExpense.metodo_pago}
              onChange={(e) => setNewExpense({ ...newExpense, metodo_pago: e.target.value })}
              className={getInputClassName(newExpense.metodo_pago)}
            >
              <option value="">Seleccionar método</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Deposito">Deposito</option>
              <option value="Efectivo">Efectivo</option>
            </select>
            <label className="block text-sm font-medium">Fecha</label>
            <Input
              type="date"
              value={newExpense.fecha}
              onChange={(e) => setNewExpense({ ...newExpense, fecha: e.target.value })}
              className={getInputClassName(newExpense.fecha)}
            />
            <label className="block text-sm font-medium">Notas</label>
            <Input
              type="text"
              placeholder="Notas"
              value={newExpense.notas}
              onChange={(e) => setNewExpense({ ...newExpense, notas: e.target.value })}
              className={getInputClassName(newExpense.notas)}
            />
          </div>
          <DialogFooter>
            <Button onClick={addExpense} className="w-full" disabled={isLoading}>
              {isLoading ? <Loader className="animate-spin" /> : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 