/** What the hero's code editor types, tab by tab. */
export const EDITOR_FILES = [
  {
    tab: 'ProyectosController.cs',
    lang: 'C#',
    code: `[ApiController]
[Route("api/[controller]")]
public class ProyectosController : ControllerBase
{
    private readonly IProyectoService _service;

    public ProyectosController(IProyectoService service)
        => _service = service;

    [HttpGet]
    public async Task<IActionResult> Listar()
        => Ok(await _service.ListarAsync());
}`,
  },
  {
    tab: 'Proyectos.tsx',
    lang: 'TypeScript React',
    code: `export function Proyectos() {
  const { data, isLoading } = useQuery({
    queryKey: ['proyectos'],
    queryFn: () => api.get<Proyecto[]>('/api/proyectos'),
  });

  if (isLoading) return <Skeleton rows={3} />;

  return data.map((p) => (
    <ProyectoCard key={p.id} {...p} />
  ));
}`,
  },
  {
    tab: 'terminal',
    lang: 'bash',
    term: true,
    code: `$ dotnet run
info: Now listening on https://localhost:5001
$ npm run dev
  VITE ready in 312 ms
$ curl localhost:5001/api/proyectos
200 OK · 8 proyectos · 18 ms
$ git push origin main
✓ Desplegado`,
  },
];
