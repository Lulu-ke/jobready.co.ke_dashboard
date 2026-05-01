import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const mockCategories = [
  { id: '1', name: 'Technology', slug: 'technology', jobs: 45, status: 'Active' },
  { id: '2', name: 'Finance', slug: 'finance', jobs: 32, status: 'Active' },
  { id: '3', name: 'Healthcare', slug: 'healthcare', jobs: 28, status: 'Active' },
  { id: '4', name: 'Education', slug: 'education', jobs: 21, status: 'Active' },
  { id: '5', name: 'Engineering', slug: 'engineering', jobs: 18, status: 'Active' },
  { id: '6', name: 'Marketing', slug: 'marketing', jobs: 15, status: 'Active' },
  { id: '7', name: 'Legal', slug: 'legal', jobs: 12, status: 'Active' },
  { id: '8', name: 'Creative', slug: 'creative', jobs: 9, status: 'Inactive' },
]

const mockArticles = [
  { id: '1', title: 'How to Write a Winning CV in Kenya', status: 'Published', views: 1240 },
  { id: '2', title: 'Top 10 Interview Tips for 2025', status: 'Published', views: 890 },
  { id: '3', title: 'Guide to Remote Work in Kenya', status: 'Draft', views: 0 },
]

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-500 mt-1">Manage categories, articles, and platform content</p>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Job Categories</CardTitle>
            <CardDescription>Manage job categories</CardDescription>
          </div>
          <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
            <Plus className="w-4 h-4 mr-1" /> Add Category
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead className="px-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCategories.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-gray-50">
                    <TableCell className="px-6 font-medium text-gray-900">{cat.name}</TableCell>
                    <TableCell className="text-sm text-gray-400 font-mono">{cat.slug}</TableCell>
                    <TableCell className="text-sm text-gray-600">{cat.jobs}</TableCell>
                    <TableCell className="px-6">
                      <Badge variant="secondary" className={
                        cat.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                      }>
                        {cat.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Articles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Career Articles</CardTitle>
            <CardDescription>Blog posts and career resources</CardDescription>
          </div>
          <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
            <Plus className="w-4 h-4 mr-1" /> New Article
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="px-6">Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockArticles.map((article) => (
                <TableRow key={article.id} className="hover:bg-gray-50">
                  <TableCell className="px-6 font-medium text-gray-900">{article.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={
                      article.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }>
                      {article.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 text-sm text-gray-500">
                    {article.views.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Platform Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform Updates</CardTitle>
          <CardDescription>Announcements and changelog entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No platform updates yet. This section is coming soon.</p>
            <Button size="sm" variant="outline" className="mt-3 text-teal-700 border-teal-200">
              <Plus className="w-4 h-4 mr-1" /> Add Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
