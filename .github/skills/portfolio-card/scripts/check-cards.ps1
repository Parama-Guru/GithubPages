<#
.SYNOPSIS
  Checks every card in the root index.html against the portfolio card rules (see ../SKILL.md).
.EXAMPLE
  powershell -NoProfile -File .github/skills/portfolio-card/scripts/check-cards.ps1
#>
param(
  [string]$Index = (Join-Path $PSScriptRoot '..\..\..\..\index.html')
)

$ErrorActionPreference = 'Stop'
$limits = @{ about = 120; title = 40; meta = 48 }
$indexPath = (Resolve-Path -LiteralPath $Index).Path
$root = Split-Path -Parent $indexPath
$html = [IO.File]::ReadAllText($indexPath)

function Get-Ids([string]$list) {
  $block = [regex]::Match($html, "const $list = \[(.*?)\];", 'Singleline').Groups[1].Value
  @([regex]::Matches($block, 'id: "([^"]+)"') | ForEach-Object { $_.Groups[1].Value })
}
function Get-Text([string]$fragment) {
  [Net.WebUtility]::HtmlDecode((($fragment -replace '<[^>]+>', ' ') -replace '\s+', ' ').Trim())
}
function Get-Attr([string]$attrs, [string]$name) {
  $m = [regex]::Match($attrs, "\s$name=""([^""]*)""")
  if ($m.Success) { $m.Groups[1].Value } else { '' }
}

$products = Get-Ids 'PRODUCTS'
$types = Get-Ids 'TYPES'
$folders = @(Get-ChildItem -LiteralPath $root -Directory | ForEach-Object { $_.Name })
$seen = @{}
$failed = 0
$count = 0

$rows = foreach ($card in [regex]::Matches($html, '(?s)<a class="card"([^>]*)>(.*?)</a>')) {
  $count++
  $attrs = $card.Groups[1].Value
  $body = $card.Groups[2].Value
  $href = Get-Attr $attrs 'href'
  $product = Get-Attr $attrs 'data-product'
  $type = Get-Attr $attrs 'data-type'
  $year = Get-Attr $attrs 'data-year'
  $meta = Get-Text ([regex]::Match($body, '(?s)<p class="card-meta">(.*?)</p>').Groups[1].Value)
  $title = Get-Text ([regex]::Match($body, '(?s)<h2>(.*?)</h2>').Groups[1].Value)
  $about = Get-Text ([regex]::Match($body, '(?s)</h2>\s*<p>(.*?)</p>').Groups[1].Value)
  $segments = @($meta -split ' / ')
  $issues = New-Object System.Collections.Generic.List[string]

  if ($href -match '^([A-Za-z0-9._-]+)/$') {
    if ($folders -cnotcontains $Matches[1]) { $issues.Add("no folder '$($Matches[1])' (case-sensitive)") }
  }
  elseif ($href -notmatch '^https://\S+$') { $issues.Add("href '$href' is neither https:// nor folder/") }
  if ($seen.ContainsKey($href)) { $issues.Add('duplicate href') }
  $seen[$href] = $true
  if ($products -cnotcontains $product) { $issues.Add("product '$product' is not in PRODUCTS") }
  if (-not $type) { $issues.Add('no data-type') }
  elseif ($types -cnotcontains $type) { $issues.Add("type '$type' is not in TYPES") }
  if ($year -notmatch '^\d{4}$') { $issues.Add("year '$year'") }
  elseif ($meta -notmatch "\b$year\b") { $issues.Add('meta lacks data-year') }
  if (-not $meta -or $meta.Length -gt $limits.meta) { $issues.Add("meta $($meta.Length)/$($limits.meta)") }
  if ($segments.Count -gt 3) { $issues.Add('meta has more than 3 segments') }
  if (@($segments | Where-Object { $_ -cnotmatch '^[A-Z0-9]' }).Count) { $issues.Add('meta segment starts in lower case') }
  if (-not $title -or $title.Length -gt $limits.title) { $issues.Add("title $($title.Length)/$($limits.title)") }
  if (-not $about -or $about.Length -gt $limits.about) { $issues.Add("about $($about.Length)/$($limits.about)") }
  if ($about -and $about -notmatch '[.!?]$') { $issues.Add('about must end with a full stop') }

  $status = 'ok'
  if ($issues.Count) { $failed++; $status = $issues -join '; ' }
  [pscustomobject]@{ '#' = $count; About = $about.Length; Title = $title; Product = $product; Type = $type; Year = $year; Status = $status }
}

$rows | Format-Table -AutoSize | Out-String -Width 220 | Write-Host
if ($count -eq 0) { Write-Host 'No cards found.'; exit 1 }
if ($failed) { Write-Host "$failed of $count cards break the rules."; exit 1 }
Write-Host "All $count cards follow the rules (about <= $($limits.about), title <= $($limits.title), meta <= $($limits.meta) characters)."
