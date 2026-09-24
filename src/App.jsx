import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Zap,
  Shield,
  ChevronRight,
  RefreshCw,
  Move3D,
  Flame,
  Droplets,
  Leaf,
  Circle,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Swords,
  Activity,
} from "lucide-react";

// --- КОНФІГУРАЦІЯ ТА ДАНІ ---
const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const POKEMON_IDS = [25, 1, 4, 7, 133]; // Пікачу, Бульбазавр, Чармандер, Сквіртл, Іві

const POKEMON_TYPES_META = {
  electric: {
    bg: "from-yellow-400/30 to-amber-600/10",
    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: Zap,
    color: "text-yellow-400",
  },
  grass: {
    bg: "from-emerald-400/30 to-teal-600/10",
    badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    icon: Leaf,
    color: "text-emerald-400",
  },
  fire: {
    bg: "from-red-500/30 to-rose-600/10",
    badge: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: Flame,
    color: "text-red-500",
  },
  water: {
    bg: "from-blue-500/30 to-cyan-600/10",
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Droplets,
    color: "text-blue-500",
  },
  poison: {
    bg: "from-purple-500/30 to-fuchsia-600/10",
    badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: Circle,
    color: "text-purple-400",
  },
  flying: {
    bg: "from-sky-500/30 to-indigo-600/10",
    badge: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    icon: Circle,
    color: "text-sky-400",
  },
  bug: {
    bg: "from-lime-500/30 to-emerald-600/10",
    badge: "bg-lime-500/20 text-lime-400 border-lime-500/30",
    icon: Circle,
    color: "text-lime-400",
  },
  normal: {
    bg: "from-slate-400/30 to-slate-600/10",
    badge: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    icon: Circle,
    color: "text-slate-400",
  },
  // Загальний дефолт для інших типів
  default: {
    bg: "from-slate-600/30 to-slate-800/10",
    badge: "bg-slate-600/20 text-slate-300 border-slate-500/30",
    icon: Circle,
    color: "text-slate-300",
  }
};

const getTypeMeta = (typeName) => POKEMON_TYPES_META[typeName] || POKEMON_TYPES_META.default;

// --- ДОПОМІЖНІ ФУНКЦІЇ ---
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

const getSpeciesIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split("/");
  return parseInt(parts[parts.length - 2]);
};

// --- КОМПОНЕНТИ АНІМАЦІЇ ПОКЕБОЛА ---
const PokeballLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center select-none">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-red-500/20 blur-xl"
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="relative w-24 h-24 rounded-full border-4 border-slate-900 bg-gradient-to-b from-red-500 via-red-500 to-white overflow-hidden shadow-2xl"
          initial={{ y: -80, opacity: 0, rotate: -45 }}
          animate={{
            y: [ -80, 0, 0, 0, 0, 0 ],
            opacity: [0, 1, 1, 1, 1, 1],
            rotate: [ -45, 0, -10, 10, -8, 8, -4, 4, 0 ],
            scale: [1, 1, 1.05, 1, 1.05, 1]
          }}
          transition={{
            duration: 1.4,
            times: [0, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
            repeat: Infinity,
            repeatDelay: 0.2
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-red-600 border-b-4 border-slate-900" />
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-3 bg-slate-900 z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full border-4 border-slate-900 z-20 flex items-center justify-center shadow-inner">
            <motion.div 
              className="w-2.5 h-2.5 bg-blue-400 rounded-full"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>

      <motion.p
        className="text-xl font-bold text-slate-400 mt-6 tracking-wide"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        Кидаємо покебол... 🔴⚪
      </motion.p>
    </div>
  );
};

// --- КОМПОНЕНТИ UI ---

// 1. Головна картка покемона
const InteractivePokemonCard = ({ pokemon, animatedSprite, evolutionChain, onSelectPokemon }) => {
  const typeInfo = getTypeMeta(pokemon?.types[0]?.type?.name);
  const TypeIcon = typeInfo.icon;
  const stats = pokemon?.stats || [];

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 bg-gradient-to-br ${typeInfo.bg} p-4 shadow-xl md:rounded-3xl md:p-6 flex flex-col justify-between`}
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      transition={{ duration: 0.35, type: "spring", bounce: 0.2 }}
    >
      <div
        className={`absolute -top-14 -right-14 h-44 w-44 rounded-full opacity-15 ${typeInfo.color} bg-current`}
      />

      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-100 md:text-3xl">
              {capitalize(pokemon?.name)}
            </h2>
          </div>
          <span className="text-3xl font-black tracking-tight text-slate-600 md:text-4xl">
            #{String(pokemon?.id).padStart(3, "0")}
          </span>
        </div>

        <div className="flex min-h-[180px] items-center justify-center md:min-h-[240px] my-2">
          <div className="relative flex items-center justify-center">
            <motion.div 
              className="absolute w-36 h-36 rounded-full bg-white/10 blur-md pointer-events-none"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0.5, 1.8], opacity: [1, 0] }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />

            <AnimatePresence mode="wait">
              <motion.img
                key={animatedSprite}
                src={animatedSprite}
                alt={pokemon?.name}
                className="relative z-10 h-[140px] w-auto object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.5)] md:h-[200px]"
                initial={{ opacity: 0, scale: 0.5, filter: "brightness(2) blur(4px)" }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  filter: "brightness(1) blur(0px) drop-shadow(0 15px 20px rgba(0,0,0,0.5))",
                }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                transition={{ duration: 0.35, type: "spring", bounce: 0.3 }}
              />
            </AnimatePresence>
          </div>
        </div>

        {evolutionChain && evolutionChain.length > 1 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium flex items-center gap-1.5">
                <Sparkles size={13} className={typeInfo.color} /> Стадії еволюції
              </span>
              <span className="text-[11px] text-slate-500">Клікніть, щоб змінити</span>
            </div>
            <div className="grid grid-flow-col auto-cols-fr gap-2 overflow-x-auto pb-1">
              {evolutionChain.map((stage) => {
                const speciesId = getSpeciesIdFromUrl(stage.species.url);
                const isSelected = speciesId === pokemon.id;
                const stageSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`;

                return (
                  <button
                    key={stage.species.name}
                    type="button"
                    onClick={() => onSelectPokemon(speciesId)}
                    className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-blue-600/30 border-blue-500 shadow-md ring-1 ring-blue-500/50"
                        : "bg-black/30 border-white/5 hover:border-slate-600 hover:bg-black/50"
                    }`}
                  >
                    <img
                      src={stageSprite}
                      alt={stage.species.name}
                      className="h-10 w-10 object-contain transition-transform group-hover:scale-110"
                    />
                    <span className={`text-[11px] font-semibold mt-1 truncate max-w-full ${isSelected ? "text-white" : "text-slate-300"}`}>
                      {capitalize(stage.species.name)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/5 bg-black/20 p-2.5 md:p-3">
          <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2">
            <div className={`rounded-full bg-white/5 p-1.5 ${typeInfo.color}`}>
              <Zap size={16} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">HP</div>
              <div className="text-sm font-bold text-white">{stats[0]?.base_stat ?? 0}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2">
            <div className={`rounded-full bg-white/5 p-1.5 ${typeInfo.color}`}>
              <Shield size={16} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">ATK</div>
              <div className="text-sm font-bold text-white">{stats[1]?.base_stat ?? 0}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2">
            <div className={`rounded-full bg-white/5 p-1.5 ${typeInfo.color}`}>
              <Move3D size={16} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">DEF</div>
              <div className="text-sm font-bold text-white">{stats[2]?.base_stat ?? 0}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2">
            <div className={`rounded-full bg-white/5 p-1.5 ${typeInfo.color}`}>
              <RefreshCw size={16} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">SPD</div>
              <div className="text-sm font-bold text-white">{stats[5]?.base_stat ?? 0}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 2. Блок ефективності типів (Weaknesses & Resistances)
const TypeEffectivenessPanel = ({ typeDamageRelations }) => {
  const { weaknesses, resistances } = typeDamageRelations;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-inner md:rounded-3xl md:p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-300 md:text-sm font-semibold flex items-center gap-2">
          <ShieldAlert size={16} className="text-rose-400" /> Ефективність типів (Шкода)
        </p>
      </div>

      <div className="space-y-2.5">
        <div>
          <div className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <ShieldOff size={12} /> Слабкості (2x шкода)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {weaknesses.length > 0 ? (
              weaknesses.map((typeName) => {
                const meta = getTypeMeta(typeName);
                return (
                  <span
                    key={typeName}
                    className={`px-2 py-0.5 rounded-xl text-xs font-bold border ${meta.badge}`}
                  >
                    {capitalize(typeName)}
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-slate-500 italic">Немає яскравих слабкостей</span>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800">
          <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <ShieldCheck size={12} /> Опір / Стійкість (0.5x шкода)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {resistances.length > 0 ? (
              resistances.map((typeName) => {
                const meta = getTypeMeta(typeName);
                return (
                  <span
                    key={typeName}
                    className={`px-2 py-0.5 rounded-xl text-xs font-bold border ${meta.badge}`}
                  >
                    {capitalize(typeName)}
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-slate-500 italic">Звичайний опір</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Блок атак покемона (Moves)
const MovesPanel = ({ moves }) => {
  const getCategoryBadge = (category) => {
    switch (category) {
      case "physical":
        return { text: "Фізична", bg: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
      case "special":
        return { text: "Спеціальна", bg: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
      default:
        return { text: "Статус", bg: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-inner md:rounded-3xl md:p-5 flex flex-col justify-between flex-grow">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-300 md:text-sm font-semibold flex items-center gap-2">
            <Swords size={16} className="text-amber-400" /> Бойові атаки (Moves)
          </p>
          <span className="text-[11px] text-slate-500">Топ здібностей</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {moves && moves.length > 0 ? (
            moves.map((move) => {
              const typeMeta = getTypeMeta(move.type);
              const catInfo = getCategoryBadge(move.category);

              return (
                <div
                  key={move.name}
                  className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-bold text-white truncate">
                      {capitalize(move.name.replace("-", " "))}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${typeMeta.badge}`}>
                        {capitalize(move.type)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${catInfo.bg}`}>
                        {catInfo.text}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
                    <div>Потужність: <span className="text-white font-semibold">{move.power ?? "—"}</span></div>
                    <div>Точність: <span className="text-white font-semibold">{move.accuracy ? `${move.accuracy}%` : "—"}</span></div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-4 text-center text-xs text-slate-500 italic">
              Атаки не знайдено
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. Пошук і меню всіх покемонів
const PokemonDirectoryPanel = ({
  allPokemon,
  searchQuery,
  onSearchChange,
  onSelectPokemon,
  selectedId,
  isOpen,
  onToggle,
  onRandomPokemon,
}) => {
  const filteredPokemon = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allPokemon;

    return allPokemon.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(query),
    );
  }, [allPokemon, searchQuery]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-inner md:rounded-3xl md:p-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-grow items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-left transition-colors hover:bg-slate-800 md:py-3"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-500/10 p-2 text-blue-400">
              <Search size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white md:text-base">
                Всі покемони
              </div>
              <div className="hidden text-xs text-slate-400 sm:block">
                Пошук і вибір зі списку 151 покемона
              </div>
            </div>
          </div>
          <div
            className={`text-slate-300 transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            <ChevronRight size={18} />
          </div>
        </button>

        <button
          type="button"
          onClick={onRandomPokemon}
          title="Випадковий покемон"
          className="flex items-center gap-1.5 px-4 py-2.5 md:py-3 bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600/30 rounded-2xl font-semibold text-sm transition-all shadow-lg active:scale-95"
        >
          <RefreshCw size={16} className="animate-spin-slow" />
          <span className="hidden sm:inline">Випадковий</span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mb-4 rounded-2xl border border-slate-700 bg-slate-950/60 px-3 py-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Search size={16} />
                <input
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Наприклад: pikachu"
                  className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="max-h-[180px] overflow-y-auto pr-1 md:max-h-[240px]">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {filteredPokemon.length > 0 ? (
                  filteredPokemon.map((pokemon) => (
                    <button
                      key={pokemon.id}
                      type="button"
                      onClick={() => {
                        onSelectPokemon(pokemon.name);
                        onToggle();
                      }}
                      className={`rounded-2xl border px-2 py-2 text-left transition-all ${
                        selectedId === pokemon.id
                          ? "border-blue-500 bg-blue-600/20 shadow-lg"
                          : "border-slate-700 bg-slate-800/50 hover:border-blue-800 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        #{String(pokemon.id).padStart(3, "0")}
                      </div>
                      <div className="text-sm font-semibold text-slate-100">
                        {capitalize(pokemon.name)}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-700 bg-slate-800/30 p-4 text-sm text-slate-400">
                    Нічого не знайдено
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- ГОЛОВНИЙ КОМПОНЕНТ ---
export default function App() {
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [typeDamageRelations, setTypeDamageRelations] = useState({ weaknesses: [], resistances: [] });
  const [movesList, setMovesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allPokemon, setAllPokemon] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [directoryOpen, setDirectoryOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadAllPokemon = async () => {
      try {
        const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=151`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to load Pokémon list");
        const data = await response.json();
        const list = data.results.map((pokemon, index) => ({
          id: index + 1,
          name: pokemon.name,
        }));
        setAllPokemon(list);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      }
    };

    loadAllPokemon();
    loadPokemonData(POKEMON_IDS[0], controller.signal);
    return () => controller.abort();
  }, []);

  const loadPokemonData = async (idOrName, signal) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const resMain = await fetch(`${POKEAPI_BASE}/pokemon/${idOrName}`, {
        signal,
      });
      if (!resMain.ok) throw new Error(`Pokémon ${idOrName} not found.`);
      const pokemonData = await resMain.json();

      const resSpecies = await fetch(pokemonData.species.url, { signal });
      const speciesData = await resSpecies.json();

      const resChain = await fetch(speciesData.evolution_chain.url, { signal });
      const chainData = await resChain.json();

      const chainList = [];
      let currentStage = chainData.chain;
      do {
        chainList.push({
          species: currentStage.species,
          id: getSpeciesIdFromUrl(currentStage.species.url),
        });
        currentStage = currentStage.evolves_to[0];
      } while (currentStage);

      // Завантажуємо дані типів для розрахунку ефективності (слабкостей / опірності)
      const typePromises = pokemonData.types.map(async (t) => {
        const res = await fetch(t.type.url, { signal });
        return res.json();
      });
      const typeDataList = await Promise.all(typePromises);

      const weakSet = new Set();
      const resistSet = new Set();

      typeDataList.forEach((tData) => {
        tData.damage_relations.double_damage_from.forEach((d) => weakSet.add(d.name));
        tData.damage_relations.half_damage_from.forEach((d) => resistSet.add(d.name));
      });

      setTypeDamageRelations({
        weaknesses: Array.from(weakSet),
        resistances: Array.from(resistSet),
      });

      // Завантажуємо перші 6 атак покемона з їхніми деталями
      const firstMoves = pokemonData.moves.slice(0, 6);
      const movePromises = firstMoves.map(async (m) => {
        const res = await fetch(m.move.url, { signal });
        const moveData = await res.json();
        return {
          name: moveData.name,
          type: moveData.type.name,
          category: moveData.damage_class.name,
          power: moveData.power,
          accuracy: moveData.accuracy,
        };
      });
      const resolvedMoves = await Promise.all(movePromises);
      setMovesList(resolvedMoves);

      setPokemon(pokemonData);
      setSpecies(speciesData);
      setEvolutionChain(chainList);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPokemon = async (idOrName) => {
    await loadPokemonData(idOrName);
  };

  const handleRandomPokemon = () => {
    const randomId = Math.floor(Math.random() * 151) + 1;
    loadPokemonData(randomId);
  };

  const mainSprite = useMemo(() => {
    if (!pokemon) return "";
    try {
      return pokemon.sprites.other["official-artwork"].front_default;
    } catch {
      return pokemon.sprites.front_default;
    }
  }, [pokemon]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 font-sans md:p-6 lg:p-8">
<header className="mb-2 flex items-center justify-between gap-2 border-b border-slate-800 pb-2 lg:mb-3 lg:pb-2 lg:py-1">
        <div className="flex items-center gap-2 lg:gap-2.5">
          <div className="rounded-xl bg-blue-600 p-1.5 shadow-md lg:p-1">
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
              alt="Pikachu"
              className="h-6 w-6 lg:h-5 lg:w-5"
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tighter text-white lg:text-2xl">
              Poké<span className="text-blue-400">Dex</span> 3D
            </h1>
            <p className="mt-0.5 hidden text-xs text-slate-400 sm:block lg:text-[11px]">
              Інтерактивний перегляд покемонів та їх еволюції
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <PokeballLoader />
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center text-red-500 bg-red-500/15 rounded-3xl border border-red-900 p-10">
          <Search size={64} className="mb-4" />
          <p className="text-3xl font-bold">Помилка завантаження</p>
          <p className="text-xl mt-2">{error}</p>
          <button
            onClick={() => loadPokemonData(25)}
            className="mt-8 px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold"
          >
            Спробувати з Пікачу
          </button>
        </div>
      ) : (
        pokemon && (
          <div className="space-y-3 md:space-y-5">
            <PokemonDirectoryPanel
              allPokemon={allPokemon}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectPokemon={handleSelectPokemon}
              selectedId={pokemon.id}
              isOpen={directoryOpen}
              onToggle={() => setDirectoryOpen((prev) => !prev)}
              onRandomPokemon={handleRandomPokemon}
            />

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1.25fr] md:gap-5">
              {/* Картка покемона з інтерактивними стадіями */}
              <InteractivePokemonCard
                key={pokemon.id}
                pokemon={pokemon}
                animatedSprite={mainSprite}
                evolutionChain={evolutionChain}
                onSelectPokemon={handleSelectPokemon}
              />

              {/* Права колонка: Базова інформація + Ефективність типів + Атаки */}
              <div className="flex flex-col gap-3 md:gap-5 justify-between">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-inner md:rounded-3xl md:p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-300 md:text-sm font-semibold">
                    Базова інформація
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:mt-5 md:gap-3 xl:grid-cols-4">
                    <div className="rounded-2xl bg-slate-800/60 p-2.5 md:p-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Середовище</div>
                      <div className="mt-1 font-semibold text-white">{capitalize(species?.habitat?.name) || "Невідомо"}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-800/60 p-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Покоління</div>
                      <div className="mt-1 font-semibold text-white">
                        {species?.generation?.name.toUpperCase().replace("GENERATION-", "ПОКОЛІННЯ ") || "Невідомо"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-800/60 p-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Зріст</div>
                      <div className="mt-1 font-semibold text-white">{(pokemon?.height / 10).toFixed(1)} м</div>
                    </div>
                    <div className="rounded-2xl bg-slate-800/60 p-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Вага</div>
                      <div className="mt-1 font-semibold text-white">{(pokemon?.weight / 10).toFixed(1)} кг</div>
                    </div>
                    <div className="rounded-2xl bg-slate-800/60 p-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Тип</div>
                      <div className="mt-1 font-semibold text-white">
                        {pokemon?.types?.map((item) => capitalize(item.type.name)).join(", ") || "Невідомо"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-800/60 p-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Становлення</div>
                      <div className="mt-1 font-semibold text-white">
                        {species?.is_legendary ? "Легендарний" : species?.is_mythical ? "Міфічний" : "Звичайний"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-800/60 p-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Категорія</div>
                      <div className="mt-1 font-semibold text-white">{capitalize(species?.shape?.name) || "Невідомо"}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-800/60 p-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">ID</div>
                      <div className="mt-1 font-semibold text-white">#{String(pokemon?.id).padStart(3, "0")}</div>
                    </div>
                  </div>
                </div>

                {/* Таблиця ефективності типів */}
                <TypeEffectivenessPanel typeDamageRelations={typeDamageRelations} />

                {/* Блок бойових атак */}
                <MovesPanel moves={movesList} />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}