export interface IDotTracesSelectedService {
    selectedObjects: any;
    chosenVariants: any;
    setChosenVariants(objects): void;
    setChosenVariantsByIds(ids): void;
    setObjects(objects): void;
    setObjectsByIds(ids): void;
    removeObjects(): void;
}