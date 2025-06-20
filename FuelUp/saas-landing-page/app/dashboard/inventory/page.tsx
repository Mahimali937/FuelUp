"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Minus, Settings, Scale, Trash2, AlertTriangle, Barcode, Edit, RefreshCw } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { InventoryItem as OriginalInventoryItem } from "@/lib/types"

type Category = {
  id: string
  name: string
  description?: string
}

type InventoryItem = OriginalInventoryItem & {
  hasLimit?: boolean
  cost?: number
}
import { addInventoryItem, getInventoryItems, updateInventoryItem, formatTimeRestriction } from "@/lib/data"
import Link from "next/link"

const initialNewItem = {
  id: "",
  name: "",
  category: "essentials",
  quantity: 0,
  studentLimit: 1,
  limitDuration: 7,
  limitDurationMinutes: 0,
  unit: "item" as "item" | "kg" | "lb" | null,
  isWeighed: false,
  hasLimit: true,
  cost: 0,
}

const getCategories = (): Category[] => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem("inventory_categories")
  if (stored) {
    try {
      return JSON.parse(stored) as Category[]
    } catch (error) {
      console.error("Error parsing categories:", error)
      return []
    }
  }

  return [
    { id: "essentials", name: "Essentials", description: "Basic food items" },
    { id: "grains", name: "Grains", description: "Rice, pasta, and other grains" },
    { id: "canned", name: "Canned Goods", description: "Canned foods and preserved items" },
    { id: "produce", name: "Produce", description: "Fresh fruits and vegetables" },
    { id: "dairy", name: "Dairy", description: "Milk, cheese, and other dairy products" },
    { id: "south-asian", name: "South Asian", description: "South Asian food items" },
    { id: "other", name: "Other", description: "Miscellaneous items" },
  ]
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [userType, setUserType] = useState("")
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  // New item form state including an "id" property for barcode support
  const [newItem, setNewItem] = useState(initialNewItem)

  // Add quantity form state
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [quantityToAdd, setQuantityToAdd] = useState(0)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Remove quantity form state
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [quantityToRemove, setQuantityToRemove] = useState(0)

  // Limits form state
  const [isLimitsDialogOpen, setIsLimitsDialogOpen] = useState(false)
  const [studentLimit, setStudentLimit] = useState(1)
  const [limitDuration, setLimitDuration] = useState(7)
  const [limitDurationMinutes, setLimitDurationMinutes] = useState(0)
  const [hasLimit, setHasLimit] = useState(true)

  // Delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null)

  // Edit item dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType || "")

    // Check for barcode parameter in URL
    const params = new URLSearchParams(window.location.search)
    const barcodeParam = params.get("barcode")
    if (barcodeParam) {
      const dialogTrigger = document.querySelector('[data-dialog-trigger="add-item"]') as HTMLButtonElement
      if (dialogTrigger) {
        dialogTrigger.click()
        setNewItem((prev) => ({
          ...prev,
          id: barcodeParam,
        }))
      }
    }

    // Load inventory data and categories
    loadInventory()
    loadCategories()
  }, [lastRefreshed])

  useEffect(() => {
    // Filter items based on search query and category
    let filtered = [...items]

    if (searchQuery) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    setFilteredItems(filtered)
  }, [items, searchQuery, categoryFilter])

  const loadInventory = () => {
    const inventoryItems = getInventoryItems()
    setItems(inventoryItems)
    setFilteredItems(inventoryItems)
    setIsLoading(false)
  }

  const loadCategories = () => {
    const cats = getCategories()
    setCategories(cats.map(({ id, name }) => ({ id, name })))
  }

  const refreshInventory = () => {
    setLastRefreshed(new Date())
  }

  const handleAddNewItem = () => {
    if (!newItem.name || newItem.quantity <= 0) {
      alert("Please enter a valid item name and quantity")
      return
    }

    // Ensure unit is one of the allowed values
    let unit: "item" | "kg" | "lb" | null = "item"
    if (newItem.isWeighed && (newItem.unit === "kg" || newItem.unit === "lb")) {
      unit = newItem.unit
    }

    addInventoryItem({
      id: newItem.id || Date.now().toString(),
      name: newItem.name,
      category: newItem.category,
      quantity: newItem.quantity,
      studentLimit: newItem.studentLimit,
      limitDuration: newItem.limitDuration,
      limitDurationMinutes: newItem.limitDurationMinutes,
      unit: unit,
      isWeighed: newItem.isWeighed,
    })

    // Reset form and reload inventory
    setNewItem(initialNewItem)
    loadInventory()
  }

  const handleAddQuantity = () => {
    if (!selectedItem || quantityToAdd <= 0) {
      alert("Please select a valid item and quantity")
      return
    }

    const updatedItem = {
      ...selectedItem,
      quantity: selectedItem.quantity + quantityToAdd,
    }

    updateInventoryItem(updatedItem)
    setSelectedItem(null)
    setQuantityToAdd(0)
    setIsAddDialogOpen(false)
    loadInventory()
  }

  const handleRemoveQuantity = () => {
    if (!selectedItem || quantityToRemove <= 0) {
      alert("Please select a valid item and quantity")
      return
    }

    if (quantityToRemove > selectedItem.quantity) {
      alert(`Cannot remove more than the available quantity (${selectedItem.quantity})`)
      return
    }

    const updatedItem = {
      ...selectedItem,
      quantity: selectedItem.quantity - quantityToRemove,
    }

    updateInventoryItem(updatedItem)
    setSelectedItem(null)
    setQuantityToRemove(0)
    setIsRemoveDialogOpen(false)
    loadInventory()
  }

  const handleUpdateLimits = () => {
    if (!selectedItem) {
      alert("No item selected")
      return
    }

    const updatedItem = {
      ...selectedItem,
      studentLimit,
      limitDuration,
      limitDurationMinutes,
    }

    updateInventoryItem(updatedItem)
    setSelectedItem(null)
    setIsLimitsDialogOpen(false)
    loadInventory()
  }

  const openAddQuantityDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setQuantityToAdd(0)
    setIsAddDialogOpen(true)
  }

  const openRemoveQuantityDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setQuantityToRemove(0)
    setIsRemoveDialogOpen(true)
  }

  const openLimitsDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setStudentLimit(item.studentLimit)
    setLimitDuration(item.limitDuration)
    setLimitDurationMinutes(item.limitDurationMinutes || 0)
    setHasLimit(item.hasLimit !== undefined ? item.hasLimit : true)
    setIsLimitsDialogOpen(true)
  }

  const openDeleteDialog = (item: InventoryItem) => {
    setItemToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  const openEditDialog = (item: InventoryItem) => {
    setEditItem({ ...item })
    setIsEditDialogOpen(true)
  }

  // Function to get color based on category
  const getColorForCategory = (category: string) => {
    switch (category) {
      case "essentials":
        return "bg-amber-100"
      case "grains":
        return "bg-orange-100"
      case "canned":
        return "bg-gray-100"
      case "produce":
        return "bg-green-100"
      case "dairy":
        return "bg-blue-100"
      case "south-asian":
        return "bg-purple-100"
      default:
        return "bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-lg overflow-hidden h-40 bg-secondary">
        <div className="absolute inset-0 flex items-center">
          <div className="px-6 md:px-10">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Inventory Management</h1>
            <p className="text-lg text-primary mt-2">Manage and track all food items in the store</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Items</h2>
          <p className="text-muted-foreground">View and manage all items in the food store</p>
        </div>

        {userType === "staff" && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshInventory} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Inventory
            </Button>
            <Link href="/dashboard/barcode-scan">
              <Button variant="outline" className="flex items-center gap-2">
                <Barcode className="h-4 w-4" />
                Barcode Scanner
              </Button>
            </Link>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary text-black hover:bg-primary/90" data-dialog-trigger="add-item">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Inventory Item</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new item to add to inventory
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCategories().map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isWeighed"
                      checked={newItem.isWeighed}
                      onCheckedChange={(checked) => setNewItem({ ...newItem, isWeighed: checked })}
                    />
                    <Label htmlFor="isWeighed" className="flex items-center">
                      <Scale className="h-4 w-4 mr-2" />
                      Weighed Item
                    </Label>
                  </div>
                  {newItem.isWeighed && (
                    <div className="grid gap-2">
                      <Label htmlFor="unit">Unit of Measurement</Label>
                      <Select
                        value={newItem.unit ?? undefined}
                        onValueChange={(value: string) => {
                          if (value === "kg" || value === "lb" || value === "item") {
                            setNewItem({ ...newItem, unit: value as "item" | "kg" | "lb" })
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="lb">Pounds (lb)</SelectItem>
                          <SelectItem value="item">Items</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">
                      Initial Quantity {newItem.isWeighed ? `(${newItem.unit})` : "(items)"}
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={newItem.isWeighed ? "0.1" : "1"}
                      step={newItem.isWeighed ? "0.1" : "1"}
                      value={newItem.quantity || ""}
                      onChange={(e) =>
                        setNewItem({ ...newItem, quantity: Number.parseFloat(e.target.value) || 0 })
                      }
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cost">Cost per Unit ($)</Label>
                    <Input
                      id="cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.cost || ""}
                      onChange={(e) =>
                        setNewItem({ ...newItem, cost: Number.parseFloat(e.target.value) || 0 })
                      }
                      placeholder="Enter cost per unit"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasLimit"
                      checked={newItem.hasLimit}
                      onCheckedChange={(checked) => setNewItem({ ...newItem, hasLimit: checked })}
                    />
                    <Label htmlFor="hasLimit">Enable Item Limits</Label>
                  </div>
                  {newItem.hasLimit && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="studentLimit">
                          Student Limit {newItem.isWeighed ? `(${newItem.unit} per checkout)` : "(per checkout)"}
                        </Label>
                        <Input
                          id="studentLimit"
                          type="number"
                          min={newItem.isWeighed ? "0.1" : "1"}
                          step={newItem.isWeighed ? "0.1" : "1"}
                          value={newItem.studentLimit || ""}
                          onChange={(e) =>
                            setNewItem({ ...newItem, studentLimit: Number.parseFloat(e.target.value) || 1 })
                          }
                          placeholder="Enter student limit"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="limitDuration">Limit Duration (days)</Label>
                          <Input
                            id="limitDuration"
                            type="number"
                            min="0"
                            value={newItem.limitDuration || ""}
                            onChange={(e) =>
                              setNewItem({ ...newItem, limitDuration: Number.parseInt(e.target.value) || 0 })
                            }
                            placeholder="Enter days"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="limitDurationMinutes">Additional Minutes</Label>
                          <Input
                            id="limitDurationMinutes"
                            type="number"
                            min="0"
                            value={newItem.limitDurationMinutes || ""}
                            onChange={(e) =>
                              setNewItem({ ...newItem, limitDurationMinutes: Number.parseInt(e.target.value) || 0 })
                            }
                            placeholder="Enter minutes"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Students can only take this item once within this time period
                      </p>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleAddNewItem} className="bg-primary text-black hover:bg-primary/90">
                    Add Item
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Scale className="h-4 w-4 mr-1" />
                  Seed Prices
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Seed Random Prices</DialogTitle>
                  <DialogDescription>
                    This will add random prices to all inventory items. This is useful for testing price-related features.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    // Dummy seed function – replace with your logic if needed
                    alert("Seed random prices clicked")
                  }} className="bg-primary text-black hover:bg-primary/90">
                    Seed Random Prices
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Card className="border-t-4 border-primary">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  {userType === "staff" && (
                    <>
                      <TableHead className="text-center">Student Limits</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div
                            className={`h-10 w-10 rounded-full ${getColorForCategory(item.category)} flex items-center justify-center`}
                          >
                            <span className="text-xs font-bold uppercase text-black dark:text-black">
                              {item.category.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">{item.name}</span>
                            {item.isWeighed && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Scale className="h-3 w-3 mr-1" />
                                <span>Weighed in {item.unit}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{item.category}</TableCell>
                      <TableCell className="text-right">
                        {item.isWeighed ? (
                          <span>
                            {item.quantity.toFixed(1)} {item.unit}
                          </span>
                        ) : (
                          <span>{item.quantity}</span>
                        )}
                        {item.quantity < 10 && <span className="ml-2 text-xs text-red-500 font-medium">Low Stock</span>}
                      </TableCell>
                      {userType === "staff" && (
                        <>
                          <TableCell className="text-center">
                            {item.hasLimit ? (
                              <span className="text-sm">
                                Max{" "}
                                {item.isWeighed ? `${item.studentLimit.toFixed(1)} ${item.unit}` : item.studentLimit}{" "}
                                per student / {formatTimeRestriction(item.limitDuration, item.limitDurationMinutes || 0)}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">No limits</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                                <Edit className="h-3 w-3 mr-1" /> Edit
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openAddQuantityDialog(item)}>
                                <Plus className="h-3 w-3 mr-1" /> Add
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openRemoveQuantityDialog(item)}>
                                <Minus className="h-3 w-3 mr-1" /> Remove
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openLimitsDialog(item)}>
                                <Settings className="h-3 w-3 mr-1" /> Limits
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => openDeleteDialog(item)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" /> Delete
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={userType === "staff" ? 5 : 3} className="text-center py-4">
                      No items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Quantity Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
            <DialogDescription>Add more quantity to {selectedItem?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-quantity">
                Quantity to Add {selectedItem?.isWeighed ? `(${selectedItem?.unit})` : ""}
              </Label>
              <Input
                id="add-quantity"
                type="number"
                min={selectedItem?.isWeighed ? "0.1" : "1"}
                step={selectedItem?.isWeighed ? "0.1" : "1"}
                value={quantityToAdd || ""}
                onChange={(e) => setQuantityToAdd(Number.parseFloat(e.target.value) || 0)}
                placeholder="Enter quantity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddQuantity} className="bg-primary text-black hover:bg-primary/90">
              Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Quantity Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Stock</DialogTitle>
            <DialogDescription>Remove quantity from {selectedItem?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="remove-quantity">
                Quantity to Remove {selectedItem?.isWeighed ? `(${selectedItem?.unit})` : ""}
              </Label>
              <Input
                id="remove-quantity"
                type="number"
                min={selectedItem?.isWeighed ? "0.1" : "1"}
                step={selectedItem?.isWeighed ? "0.1" : "1"}
                value={quantityToRemove || ""}
                onChange={(e) => setQuantityToRemove(Number.parseFloat(e.target.value) || 0)}
                placeholder="Enter quantity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleRemoveQuantity} className="bg-primary text-black hover:bg-primary/90">
              Remove Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Limits Dialog */}
      <Dialog open={isLimitsDialogOpen} onOpenChange={setIsLimitsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student Limits</DialogTitle>
            <DialogDescription>Set limits for {selectedItem?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Switch id="has-limit" checked={hasLimit} onCheckedChange={setHasLimit} />
              <Label htmlFor="has-limit">Enable Item Limits</Label>
            </div>
            {hasLimit && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="student-limit">
                    Maximum Quantity Per Student {selectedItem?.isWeighed ? `(${selectedItem?.unit})` : ""}
                  </Label>
                  <Input
                    id="student-limit"
                    type="number"
                    min={selectedItem?.isWeighed ? "0.1" : "1"}
                    step={selectedItem?.isWeighed ? "0.1" : "1"}
                    value={studentLimit || ""}
                    onChange={(e) => setStudentLimit(Number.parseFloat(e.target.value) || 1)}
                    placeholder="Enter limit"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum amount of this item a student can take in a single checkout
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="limit-duration">Time Restriction (days)</Label>
                    <Input
                      id="limit-duration"
                      type="number"
                      min="0"
                      value={limitDuration || ""}
                      onChange={(e) => setLimitDuration(Number.parseInt(e.target.value) || 0)}
                      placeholder="Enter days"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="limit-duration-minutes">Additional Minutes</Label>
                    <Input
                      id="limit-duration-minutes"
                      type="number"
                      min="0"
                      value={limitDurationMinutes || ""}
                      onChange={(e) => setLimitDurationMinutes(Number.parseInt(e.target.value) || 0)}
                      placeholder="Enter minutes"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Number of days and minutes before a student can take this item again
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateLimits} className="bg-primary text-black hover:bg-primary/90">
              Update Limits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}