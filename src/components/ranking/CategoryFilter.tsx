"use client"

import React, { useState, useEffect, useRef } from "react"
import { getCategoryIcon, CategoryData } from "@/lib/categories"
import { Flame } from "lucide-react"

interface CategoryFilterProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
  categories?: CategoryData[]
}

export function CategoryFilter({
  selectedCategory = "ALL",
  onSelectCategory,
  categories: initialCategories,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories || [])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftState, setScrollLeftState] = useState(0)
  const [draggedDistance, setDraggedDistance] = useState(0)

  // Cargar categorías si no se pasan por props
  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          if (data.categories) {
            setCategories(data.categories.filter((c: CategoryData) => c.isActive))
          }
        })
        .catch((e) => console.error("Error cargando categorías:", e))
    }
  }, [initialCategories])

  // Soporte para arrastrar con el ratón (Drag to scroll)
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current
    if (!el) return
    setIsDragging(true)
    setStartX(e.pageX - el.offsetLeft)
    setScrollLeftState(el.scrollLeft)
    setDraggedDistance(0)
  }

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const el = scrollContainerRef.current
    if (!el) return
    const x = e.pageX - el.offsetLeft
    const distance = Math.abs(x - startX)
    setDraggedDistance(distance)
    const walk = (x - startX) * 1.5
    el.scrollLeft = scrollLeftState - walk
  }

  const handleCategoryClick = (categoryName: string) => {
    // Evitar disparar el click si se estaba arrastrando la barra
    if (draggedDistance > 5) return
    onSelectCategory(categoryName)
  }

  return (
    <div className="relative w-full select-none">
      {/* Contenedor Deslizante con scroll suave y drag */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        className="w-full overflow-x-auto pb-1.5 scrollbar-none flex items-center gap-2 cursor-grab active:cursor-grabbing scroll-smooth"
      >
        {/* Botón Todos */}
        <button
          type="button"
          onClick={() => handleCategoryClick("ALL")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
            selectedCategory === "ALL"
              ? "bg-[#FF4A1C] text-white shadow-xs font-bold scale-102"
              : "border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[#FF4A1C]/50 hover:bg-[var(--muted-bg)]"
          }`}
        >
          <Flame className={`h-3.5 w-3.5 ${selectedCategory === "ALL" ? "text-white" : "text-[#FF4A1C]"}`} />
          <span>All</span>
        </button>

        {/* Lista de Categorías */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name || selectedCategory === cat.slug
          const Icon = getCategoryIcon(cat.icon)

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.name)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                isSelected
                  ? "bg-[#FF4A1C] text-white shadow-xs font-bold scale-102"
                  : "border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[#FF4A1C]/50 hover:bg-[var(--muted-bg)]"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-[#FF4A1C]"}`} />
              <span>{cat.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
