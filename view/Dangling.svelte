<script lang="ts">

    import { log } from "console";
import { afterUpdate, onDestroy } from "svelte";
    import type { Sortable } from "../controller/navigationItem";
    import type DanglingNavigationItem from "../controller/navigationItem";
    import type Dangle from "../model/dangle"
    export let dangling: [string, Dangle[]][];
    export let visitDangle: (dangle:Dangle) => void;
    export let navigationItems: DanglingNavigationItem[];
    export let sortableItems: Sortable[];
    export let redraw: () => void;
    export let replaceAll: () => void;
    export let createAll: () => void;
    import { Config } from '../service/config'

    $: {}
    let details = new Array<HTMLElement>();
    let  settings = Config.getSettings();
    let activeNavigation = sortableItems.find(element => element.tabIdentifier == settings.selectedTab);
    init();
    
    afterUpdate(() => {
        details = details.filter(detail => detail);
        details.forEach((detail)=> {
             if(settings.reducedIndices.contains(detail.id)) {
                 detail.removeAttribute("open");
            } 
             else {
                 detail.setAttribute("open", "open");
            }
        });
    });

    async function init() {
        settings = Config.getSettings()
        activeNavigation = sortableItems.find(element => element.tabIdentifier == settings.selectedTab);
        await redraw();
    }

    function handleClick(event) {
        event.onclick();
        init();
    }

    function expand(event, index) {
        if(event.target.tagName != "SUMMARY") { return; }
        if(settings.reducedIndices.contains(index)) {
            settings.reducedIndices.remove(index);
        } else {
            settings.reducedIndices.push(index);
        }
        Config.saveSettings();
    }

    onDestroy(() => null)

</script>

<div id="dangling-links-with-replace" class="container">
<div class="nav-header" style="display: flex; flex-direction: row; align-items: center;">
    {#each navigationItems as navigationItem}
    <span  class="nav-action-button" on:click={() => handleClick(navigationItem)} title="{navigationItem.title}"><svg viewBox="0 0 100 100" class="folder" width="20" height="20">
    {#if navigationItem.tabIdentifier == settings.selectedTab }
    <path fill="currentColor" stroke-width="5" stroke="currentColor" d="{navigationItem.iconPath}"></path>
    {:else}
    <path fill="currentColor" stroke="currentColor" d="{navigationItem.iconPath}"></path>
    {/if} 
</svg></span>
    {/each}
    <span class="nav-action-button" on:click={() => replaceAll()} title="Replace"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 4a1 1 0 0 1 1-1" />
    <path d="M15 10a1 1 0 0 1-1-1" />
    <path d="M21 4a1 1 0 0 0-1-1" />
    <path d="M21 9a1 1 0 0 1-1 1" />
    <path d="m3 7 3 3 3-3" />
    <path d="M6 10V5a2 2 0 0 1 2-2h2" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
</svg></span>
    <span class="nav-action-button" on:click={() => createAll()} title="Create Files"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
</svg></span>
</div>

<h3>Dangling links with replace</h3>

{#each dangling as [index, dangles], cnt}
<details bind:this="{details[cnt]}" id="{index}" on:click={(event) => {expand(event, index) } }>

    <summary>{index}</summary>
        <ul>
            {#each dangles as dangle}
            {#if dangle.path != index}
            <li>({dangle.filename}) line {dangle.line + 1}: 
                "<a href="{dangle.link}" on:click={(e) => visitDangle(dangle)}>{dangle.link}</a>"
            </li>
            {:else}
            <li>line {dangle.line + 1}: 
                "<a href="{dangle.link}" on:click={(e) => visitDangle(dangle)}>{dangle.link}</a>"
            </li>
            {/if}
            {/each}
        </ul>
</details>  
{/each}
</div>