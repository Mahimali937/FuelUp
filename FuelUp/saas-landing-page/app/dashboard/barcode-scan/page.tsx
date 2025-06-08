"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Barcode, Search, RefreshCw, Scan } from "lucide-react"
import { BarcodeScanner } from "@/components/barcode-scanner"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function BarcodeScanPage() {
  // States for Add New Item fields
  const [barcode, setBarcode] = useState("")
  const [itemName, setItemName] = useState("")
  const [category, setCategory] = useState("")
  const [initQuantity, setInitQuantity] = useState("1")
  const [unit, setUnit] = useState("item")
  const [studentLimit, setStudentLimit] = useState("1")
  const [limitDuration, setLimitDuration] = useState("7")
  
  // Common states
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info" | null; text: string }>({
    type: null,
    text: "",
  })
  
  // Categories for the add item form
  const [categories] = useState<{ id: string; name: string }[]>([
    { id: "essentials", name: "Essentials" },
    { id: "grains", name: "Grains" },
    { id: "dairy", name: "Dairy" },
    { id: "produce", name: "Produce" },
    { id: "canned", name: "Canned" },
    { id: "south-asian", name: "South Asian" },
  ])

  // Separate states for Search and Update sections
  const [searchBarcode, setSearchBarcode] = useState("")
  const [updateBarcode, setUpdateBarcode] = useState("")
  
  // New state to control which section is visible
  const [activeSection, setActiveSection] = useState<"search" | "update" | "add">("search")

  // New states to control the inline scanning components in search and update sections
  const [searchScannerOpen, setSearchScannerOpen] = useState(false)
  const [updateScannerOpen, setUpdateScannerOpen] = useState(false)

  // Handlers for each section
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchBarcode) {
      setMessage({ type: "error", text: "Please enter a barcode." })
      return
    }
    setIsLoading(true)
    setMessage({ type: "info", text: "Searching item..." })
    await delay(1000)
    // Simulate search result
    setMessage({ type: "info", text: "No item found. Please try again." })
    setIsLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!updateBarcode) {
      setMessage({ type: "error", text: "Please enter a barcode to update." })
      return
    }
    setIsLoading(true)
    setMessage({ type: "info", text: "Updating quantity..." })
    await delay(1000)
    // Simulate update success
    setMessage({ type: "success", text: "Quantity updated successfully!" })
    setIsLoading(false)
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcode || !itemName || !category) {
      setMessage({ type: "error", text: "Please fill in all required fields (barcode, item name, and category)." })
      return
    }
    setIsLoading(true)
    setMessage({ type: "info", text: "Adding new item..." })
    await delay(1000)
    // Simulate a successful addition
    setMessage({ type: "success", text: "Item added successfully!" })
    // Clear form fields for Add New Item section
    setBarcode("")
    setItemName("")
    setCategory("")
    setInitQuantity("1")
    setUnit("item")
    setStudentLimit("1")
    setLimitDuration("7")
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Barcode Scanner</h1>

      {/* Top navigation buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        <Button
          variant={activeSection === "search" ? "default" : "outline"}
          onClick={() => setActiveSection("search")}
        >
          <Search className="inline h-5 w-5 mr-1" />
          Search
        </Button>
        <Button
          variant={activeSection === "update" ? "default" : "outline"}
          onClick={() => setActiveSection("update")}
        >
          <RefreshCw className="inline h-5 w-5 mr-1" />
          Update
        </Button>
        <Button
          variant={activeSection === "add" ? "default" : "outline"}
          onClick={() => setActiveSection("add")}
        >
          <Barcode className="inline h-5 w-5 mr-1" />
          Add New Item
        </Button>
      </div>

      {/* Section 1: Search Item */}
      {activeSection === "search" && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Search className="inline h-5 w-5 mr-2" /> Search Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch}>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="search-barcode">Barcode</Label>
                  <Input
                    id="search-barcode"
                    value={searchBarcode}
                    onChange={(e) => setSearchBarcode(e.target.value)}
                    placeholder="Enter barcode to search"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <Button variant="outline" onClick={() => setSearchScannerOpen(true)}>
                    <Barcode className="h-5 w-5" />
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Searching...
                      </>
                    ) : (
                      "Search"
                    )}
                  </Button>
                </div>
              </div>
            </form>
            <p className="text-sm text-muted-foreground">
              Scan or enter a barcode to search for an item.
            </p>
            {searchScannerOpen && (
              <div className="mt-4">
                <BarcodeScanner
                  onScan={(code) => {
                    setSearchBarcode(code)
                    setSearchScannerOpen(false)
                  }}
                  onClose={() => setSearchScannerOpen(false)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section 2: Update Quantity */}
      {activeSection === "update" && (
        <Card>
          <CardHeader>
            <CardTitle>
              <RefreshCw className="inline h-5 w-5 mr-2" /> Update Quantity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleUpdate}>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="update-barcode">Barcode</Label>
                  <Input
                    id="update-barcode"
                    value={updateBarcode}
                    onChange={(e) => setUpdateBarcode(e.target.value)}
                    placeholder="Enter barcode to update quantity"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <Button variant="outline" onClick={() => setUpdateScannerOpen(true)}>
                    <Barcode className="h-5 w-5" />
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Updating...
                      </>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </div>
              </div>
            </form>
            <p className="text-sm text-muted-foreground">
              Scan or enter a barcode to update its quantity.
            </p>
            {updateScannerOpen && (
              <div className="mt-4">
                <BarcodeScanner
                  onScan={(code) => {
                    setUpdateBarcode(code)
                    setUpdateScannerOpen(false)
                  }}
                  onClose={() => setUpdateScannerOpen(false)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section 3: Add New Item */}
      {activeSection === "add" && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Barcode className="inline h-5 w-5 mr-2" /> Add New Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Enter item details:</p>
            <form onSubmit={handleAddItem}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="add-barcode">Barcode</Label>
                  <Input
                    id="add-barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Enter barcode"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Enter item name"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="item-category">Category</Label>
                  <select
                    id="item-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={isLoading}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="init-quantity">Initial Quantity</Label>
                  <Input
                    id="init-quantity"
                    type="number"
                    min="0"
                    value={initQuantity}
                    onChange={(e) => setInitQuantity(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <select
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={isLoading}
                  >
                    <option value="item">Item</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="lb">Pounds (lb)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="student-limit">Student Limit</Label>
                  <Input
                    id="student-limit"
                    type="number"
                    min="0"
                    value={studentLimit}
                    onChange={(e) => setStudentLimit(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="limit-duration">Limit Duration (days)</Label>
                  <Input
                    id="limit-duration"
                    type="number"
                    min="0"
                    value={limitDuration}
                    onChange={(e) => setLimitDuration(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Adding Item...
                    </>
                  ) : (
                    "Add Item"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Global message display */}
      {message.type && (
        <div
          className={`mt-2 p-2 rounded-md text-sm ${
            message.type === "error"
              ? "bg-red-100 text-red-800"
              : message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}