"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  MapPin, 
  GraduationCap,
  Briefcase,
  RotateCcw
} from "lucide-react"
import { ResponseFilters, FilterOptions } from "@/types/entities/response"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface FilterPanelProps {
  filters: ResponseFilters
  filterOptions: FilterOptions | null
  onFiltersChange: (filters: ResponseFilters) => void
  loading?: boolean
}

export function FilterPanel({ 
  filters, 
  filterOptions, 
  onFiltersChange, 
  loading = false 
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<ResponseFilters>(filters)
  
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const handleResetFilters = () => {
    const emptyFilters: ResponseFilters = {
      campus: [],
      course: [],
      userRole: [],
      completionStatus: 'all'
    }
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const handleCampusChange = (campus: string, checked: boolean) => {
    const newCampus = checked 
      ? [...(localFilters.campus || []), campus]
      : (localFilters.campus || []).filter(c => c !== campus)
    
    setLocalFilters({
      ...localFilters,
      campus: newCampus
    })
  }

  const handleCourseChange = (course: string, checked: boolean) => {
    const newCourse = checked 
      ? [...(localFilters.course || []), course]
      : (localFilters.course || []).filter(c => c !== course)
    
    setLocalFilters({
      ...localFilters,
      course: newCourse
    })
  }

  const handleRoleChange = (role: string, checked: boolean) => {
    const newRole = checked 
      ? [...(localFilters.userRole || []), role]
      : (localFilters.userRole || []).filter(r => r !== role)
    
    setLocalFilters({
      ...localFilters,
      userRole: newRole
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.campus && localFilters.campus.length > 0) count++
    if (localFilters.course && localFilters.course.length > 0) count++
    if (localFilters.userRole && localFilters.userRole.length > 0) count++
    if (localFilters.responseDate) count++
    if (localFilters.completionStatus && localFilters.completionStatus !== 'all') count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  if (loading || !filterOptions) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Carregando filtros...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filtros</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} ativo{activeFilterCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
            
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 max-h-[600px] overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Campus
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {filterOptions.campuses.map((campus) => (
                        <div key={campus.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`campus-${campus.value}`}
                            checked={localFilters.campus?.includes(campus.value) || false}
                            onCheckedChange={(checked) => 
                              handleCampusChange(campus.value, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={`campus-${campus.value}`}
                            className="flex-1 text-sm flex items-center justify-between cursor-pointer"
                          >
                            <span>{campus.label}</span>
                            <span className="text-xs text-muted-foreground">({campus.count})</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Cargo
                    </h4>
                    <div className="space-y-2">
                      {filterOptions.roles.map((role) => (
                        <div key={role.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`role-${role.value}`}
                            checked={localFilters.userRole?.includes(role.value) || false}
                            onCheckedChange={(checked) => 
                              handleRoleChange(role.value, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={`role-${role.value}`}
                            className="flex-1 text-sm flex items-center justify-between cursor-pointer"
                          >
                            <span>{role.label}</span>
                            <span className="text-xs text-muted-foreground">({role.count})</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Curso (Top 10)
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {filterOptions.courses.slice(0, 10).map((course) => (
                        <div key={course.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`course-${course.value}`}
                            checked={localFilters.course?.includes(course.value) || false}
                            onCheckedChange={(checked) => 
                              handleCourseChange(course.value, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={`course-${course.value}`}
                            className="flex-1 text-sm flex items-center justify-between cursor-pointer"
                          >
                            <span className="truncate">{course.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">({course.count})</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Período
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">De</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-start text-left">
                              {localFilters.responseDate?.from ? (
                                format(localFilters.responseDate.from, "dd/MM/yyyy", { locale: ptBR })
                              ) : (
                                <span className="text-muted-foreground">Selecionar</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={localFilters.responseDate?.from}
                              onSelect={(date) => setLocalFilters({
                                ...localFilters,
                                responseDate: {
                                  from: date || filterOptions.dateRange.earliest,
                                  to: localFilters.responseDate?.to || filterOptions.dateRange.latest
                                }
                              })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Até</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-start text-left">
                              {localFilters.responseDate?.to ? (
                                format(localFilters.responseDate.to, "dd/MM/yyyy", { locale: ptBR })
                              ) : (
                                <span className="text-muted-foreground">Selecionar</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={localFilters.responseDate?.to}
                              onSelect={(date) => setLocalFilters({
                                ...localFilters,
                                responseDate: {
                                  from: localFilters.responseDate?.from || filterOptions.dateRange.earliest,
                                  to: date || filterOptions.dateRange.latest
                                }
                              })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleApplyFilters}
                      size="sm"
                      className="flex-1 bg-upe-blue hover:bg-upe-blue/90"
                    >
                      Aplicar Filtros
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {localFilters.campus && localFilters.campus.map(campus => (
              <Badge key={campus} variant="secondary" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {campus}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleCampusChange(campus, false)}
                />
              </Badge>
            ))}
            {localFilters.userRole && localFilters.userRole.map(role => (
              <Badge key={role} variant="secondary" className="text-xs">
                <Briefcase className="h-3 w-3 mr-1" />
                {role}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleRoleChange(role, false)}
                />
              </Badge>
            ))}
            {localFilters.course && localFilters.course.map(course => (
              <Badge key={course} variant="secondary" className="text-xs">
                <GraduationCap className="h-3 w-3 mr-1" />
                {course.length > 20 ? course.substring(0, 20) + '...' : course}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleCourseChange(course, false)}
                />
              </Badge>
            ))}
            {localFilters.responseDate && (
              <Badge variant="secondary" className="text-xs">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {localFilters.responseDate.from && format(localFilters.responseDate.from, "dd/MM", { locale: ptBR })}
                {" - "}
                {localFilters.responseDate.to && format(localFilters.responseDate.to, "dd/MM", { locale: ptBR })}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setLocalFilters({
                    ...localFilters,
                    responseDate: undefined
                  })}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
